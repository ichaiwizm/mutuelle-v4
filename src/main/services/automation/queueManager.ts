import { db, schema } from "@/main/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { GlobalFlowPool } from "@/main/flows/engine/pool/GlobalFlowPool";
import { AutomationBroadcaster } from "../automationBroadcaster";
import { buildTasks, createTaskCallbacks, handleRunCompletion, handleEmptyRun } from "./queue";
import type { EnqueueItem } from "./types";
import { logger } from "@/main/services/logger";
import { captureException } from "@/main/services/monitoring";
import { CredentialsService } from "@/main/services/credentials";
import { ConfigMissingError } from "@/shared/errors";

/**
 * Get platform name from flow key
 */
function getPlatformFromFlowKey(flowKey: string): "alptis" | "swisslife" | "entoria" | null {
  if (flowKey.startsWith("alptis_")) return "alptis";
  if (flowKey.startsWith("swisslife_")) return "swisslife";
  if (flowKey.startsWith("entoria_")) return "entoria";
  return null;
}

/**
 * Validate that credentials exist for all required platforms
 */
async function validateCredentials(items: EnqueueItem[]): Promise<void> {
  // Get unique platforms from flow keys
  const platforms = new Set<string>();
  for (const item of items) {
    const platform = getPlatformFromFlowKey(item.flowKey);
    if (platform) platforms.add(platform);
  }

  // Check credentials for each platform
  const missingPlatforms: string[] = [];
  for (const platform of platforms) {
    const creds = await CredentialsService.getByPlatform(platform);
    if (!creds) {
      missingPlatforms.push(platform);
    }
  }

  if (missingPlatforms.length > 0) {
    const platformNames = missingPlatforms.map(p => {
      switch (p) {
        case "alptis": return "Alptis";
        case "swisslife": return "SwissLife";
        case "entoria": return "Entoria";
        default: return p;
      }
    }).join(", ");

    throw new ConfigMissingError(
      "credentials",
      `Identifiants manquants pour : ${platformNames}. Veuillez les configurer dans les paramètres.`,
      missingPlatforms
    );
  }
}

/**
 * Enqueue flows for parallel execution.
 * Tasks are added to the global pool with a shared concurrency limit.
 */
export async function enqueueRun(
  items: EnqueueItem[]
): Promise<{ runId: string; result: null }> {
  // Validate credentials before creating run
  await validateCredentials(items);

  const runId = randomUUID();
  const now = new Date();

  // Create run record
  await db.insert(schema.runs).values({
    id: runId,
    status: "queued",
    createdAt: now,
  });

  // Build tasks with transformations and DB insertions
  const { tasks } = await buildTasks(runId, items);

  // Handle empty run case
  if (tasks.length === 0) {
    await handleEmptyRun(runId);
    return { runId, result: null };
  }

  // Create callbacks for the global pool
  const callbacks = createTaskCallbacks(runId, tasks);

  // Broadcast run started
  AutomationBroadcaster.runStarted(runId, tasks.length);

  // Mark run as running
  await db
    .update(schema.runs)
    .set({ status: "running" })
    .where(eq(schema.runs.id, runId));

  // Enqueue to global pool (run in background)
  GlobalFlowPool.getInstance()
    .enqueueRun(runId, tasks, callbacks)
    .then(() => handleRunCompletion(runId))
    .catch(async (error) => {
      logger.error("Pool execution failed", { service: "AUTOMATION", runId }, error);
      const err = error instanceof Error ? error : new Error(String(error));
      captureException(err, {
        tags: { context: "pool-execution" },
        extra: { runId, taskCount: tasks.length },
      });
      // Mark run as failed so UI knows
      await db.update(schema.runs).set({ status: "failed" }).where(eq(schema.runs.id, runId));
      AutomationBroadcaster.runCompleted(runId, false);
    });

  // Return immediately so the UI can navigate to the live view
  return { runId, result: null };
}

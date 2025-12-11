import { db, schema } from "@/main/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { GlobalFlowPool } from "@/main/flows/engine/pool/GlobalFlowPool";
import { AutomationBroadcaster } from "../automationBroadcaster";
import { buildTasks, createTaskCallbacks, handleRunCompletion, handleEmptyRun } from "./queue";
import type { EnqueueItem } from "./types";
import { logger } from "@/main/services/logger";

/**
 * Enqueue flows for parallel execution.
 * Tasks are added to the global pool with a shared concurrency limit.
 */
export async function enqueueRun(
  items: EnqueueItem[]
): Promise<{ runId: string; result: null }> {
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
    .catch((error) => {
      logger.error("Pool execution failed", { service: "AUTOMATION", runId }, error);
    });

  // Return immediately so the UI can navigate to the live view
  return { runId, result: null };
}

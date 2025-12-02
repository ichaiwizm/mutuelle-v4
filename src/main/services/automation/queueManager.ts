import { db, schema } from "@/main/db";
import { eq, and, ne } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { GlobalFlowPool } from "@/main/flows/engine/pool/GlobalFlowPool";
import { LeadsService } from "../leadsService";
import { AutomationBroadcaster } from "../automationBroadcaster";
import { getProductConfig } from "../productConfig/productConfigCore";
import {
  transformLeadForFlow,
  hasTransformerForFlow,
} from "@/main/flows/transformers";
import { artifactsRoot } from "./utils";
import { createProgressHooks } from "./progressHooks";
import { getItem } from "./itemManager";
import type { FlowTask } from "@/main/flows/engine";
import type { TaskCallbacks } from "@/main/flows/engine/pool/types/global";
import type { StepProgressData } from "@/shared/types/step-progress";
import type { EnqueueItem } from "./types";

/**
 * Enqueue flows for parallel execution.
 * Tasks are added to the global pool with a shared concurrency limit.
 */
export async function enqueueRun(
  items: EnqueueItem[]
): Promise<{ runId: string; result: null }> {
  const runId = randomUUID();
  const now = new Date();

  await db.insert(schema.runs).values({
    id: runId,
    status: "queued",
    createdAt: now,
  });

  const tasks: FlowTask[] = [];

  for (const item of items) {
    const lead = await LeadsService.getById(item.leadId);
    if (!lead) {
      console.warn(`Lead ${item.leadId} not found, skipping`);
      continue;
    }

    const itemId = randomUUID();
    const dir = join(artifactsRoot(), runId, itemId);
    await mkdir(dir, { recursive: true });

    // Transform lead data for the flow (if transformer exists)
    let transformedData: unknown;
    if (hasTransformerForFlow(item.flowKey)) {
      try {
        transformedData = transformLeadForFlow(item.flowKey, lead);
      } catch (error) {
        console.log(
          `[TRANSFORM_ERROR] Lead ${item.leadId.substring(0, 8)}... | Flow: ${item.flowKey} | Error: ${error instanceof Error ? error.message : String(error)}`
        );
        // Persist a failed run item so the UI sees the failure explicitly
        await db.insert(schema.runItems).values({
          id: itemId,
          runId,
          flowKey: item.flowKey,
          leadId: item.leadId,
          status: "failed",
          artifactsDir: dir,
          errorMessage: error instanceof Error ? error.message : String(error),
        });
        continue;
      }
    }

    // Get product config to extract step definitions
    const productConfig = getProductConfig(item.flowKey);
    const stepDefs = productConfig?.steps ?? [];

    // Initialize steps data
    const stepsData: StepProgressData = {
      steps: stepDefs.map((s) => ({
        id: s.id,
        name: s.name,
        status: "pending" as const,
      })),
      totalSteps: stepDefs.length,
      currentStepIndex: 0,
    };

    // Insert run item with initial steps data
    await db.insert(schema.runItems).values({
      id: itemId,
      runId,
      flowKey: item.flowKey,
      leadId: item.leadId,
      status: "queued",
      artifactsDir: dir,
      stepsData: JSON.stringify(stepsData),
    });

    // Create hooks for this specific task
    const hooks = createProgressHooks(runId, itemId, stepsData);

    tasks.push({
      id: itemId,
      flowKey: item.flowKey,
      leadId: item.leadId,
      lead,
      transformedData,
      artifactsDir: dir,
      flowConfig: {
        enablePauseResume: true,
        hooks,
      },
    });
  }

  if (tasks.length === 0) {
    console.log(
      `[RUN_ERROR] Run ${runId} | No valid tasks to execute (all transformations failed or no flows selected)`
    );

    await db
      .update(schema.runs)
      .set({ status: "failed" })
      .where(eq(schema.runs.id, runId));
    return { runId, result: null };
  }

  // Create callbacks for the global pool
  const callbacks: TaskCallbacks = {
    onStart: async (taskId) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Update item status to running
      await db
        .update(schema.runItems)
        .set({ status: "running", startedAt: new Date() })
        .where(eq(schema.runItems.id, taskId));

      // Get steps data for broadcast
      const item = await getItem(taskId);
      const steps = item?.stepsData?.steps ?? [];

      AutomationBroadcaster.itemStarted(
        runId,
        taskId,
        task.flowKey,
        task.leadId,
        steps.map((s) => ({ id: s.id, name: s.name }))
      );
    },
    onComplete: async (taskId, result) => {
      // Check if already cancelled - don't overwrite
      const existingItem = await db
        .select({ status: schema.runItems.status })
        .from(schema.runItems)
        .where(eq(schema.runItems.id, taskId))
        .limit(1);

      if (existingItem[0]?.status === "cancelled") {
        return; // Don't overwrite cancelled status
      }

      // Check if this was an aborted flow
      if (result.aborted) {
        return; // Don't update, cancel() already handled it
      }

      // Update item status
      await db
        .update(schema.runItems)
        .set({
          status: result.success ? "completed" : "failed",
          completedAt: new Date(),
          errorMessage: result.error?.message ?? null,
        })
        .where(eq(schema.runItems.id, taskId));

      AutomationBroadcaster.itemCompleted(
        runId,
        taskId,
        result.success,
        result.totalDuration
      );
    },
    onError: async (taskId, error) => {
      await db
        .update(schema.runItems)
        .set({
          status: "failed",
          completedAt: new Date(),
          errorMessage: error.message,
        })
        .where(eq(schema.runItems.id, taskId));

      AutomationBroadcaster.itemFailed(runId, taskId, error.message);
    },
  };

  // Broadcast run started
  AutomationBroadcaster.runStarted(runId, tasks.length);

  await db
    .update(schema.runs)
    .set({ status: "running" })
    .where(eq(schema.runs.id, runId));

  // Enqueue to global pool (returns when all tasks complete)
  // Run in background so IPC call returns immediately
  GlobalFlowPool.getInstance()
    .enqueueRun(runId, tasks, callbacks)
    .then(async () => {
      // All tasks for this run completed - calculate final status
      const items = await db
        .select({ status: schema.runItems.status })
        .from(schema.runItems)
        .where(eq(schema.runItems.runId, runId));

      const failedCount = items.filter(
        (i) => i.status === "failed" || i.status === "cancelled"
      ).length;
      const finalStatus = failedCount > 0 ? "failed" : "done";

      console.log("\n========================================");
      console.log("RUN COMPLETION");
      console.log("========================================");
      console.log(`Run ID: ${runId}`);
      console.log(`Total tasks: ${items.length}`);
      console.log(`Failed/Cancelled: ${failedCount}`);
      console.log(`Final status: ${finalStatus.toUpperCase()}`);
      console.log("========================================\n");

      // Atomic update: only update status if not already cancelled
      await db
        .update(schema.runs)
        .set({ status: finalStatus })
        .where(and(eq(schema.runs.id, runId), ne(schema.runs.status, "cancelled")));

      // Broadcast run completed
      AutomationBroadcaster.runCompleted(runId, failedCount === 0);
    })
    .catch((error) => {
      console.error(`Pool execution failed for run ${runId}:`, error);
    });

  // Return immediately so the UI can navigate to the live view
  return { runId, result: null };
}

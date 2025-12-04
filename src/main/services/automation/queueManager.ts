import { db, schema } from "@/main/db";
import { eq, and, ne } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { GlobalFlowPool } from "@/main/flows/engine/pool/GlobalFlowPool";
import { LeadsService } from "../leadsService";
import { AutomationBroadcaster } from "../automationBroadcaster";
import { AutomationSettingsService } from "../automationSettingsService";
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

    // Get automation settings for this flow (visible mode, auto submit)
    const automationSettings = await AutomationSettingsService.get(item.flowKey);

    // In headless mode, always force autoSubmit to true (no point in stopping if invisible)
    const effectiveAutoSubmit = automationSettings?.headless !== false
      ? true
      : (automationSettings?.autoSubmit ?? true);

    tasks.push({
      id: itemId,
      flowKey: item.flowKey,
      leadId: item.leadId,
      lead,
      transformedData,
      artifactsDir: dir,
      runId,
      automationSettings: automationSettings
        ? {
            headless: automationSettings.headless,
            autoSubmit: effectiveAutoSubmit,
          }
        : undefined,
      flowConfig: {
        enablePauseResume: true,
        hooks,
        // Pass autoSubmit to FlowEngine config (false = stop before submit step)
        autoSubmit: effectiveAutoSubmit,
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
      console.log(`[CALLBACK] onStart called for task ${taskId.substring(0, 8)}...`);
      const callbackStart = Date.now();

      const task = tasks.find((t) => t.id === taskId);
      if (!task) {
        console.log(`[CALLBACK] onStart: Task not found!`);
        return;
      }
      console.log(`[CALLBACK] onStart: Found task for flow ${task.flowKey}`);

      // Update item status to running
      console.log(`[CALLBACK] onStart: Updating DB status to running...`);
      const dbUpdateStart = Date.now();
      await db
        .update(schema.runItems)
        .set({ status: "running", startedAt: new Date() })
        .where(eq(schema.runItems.id, taskId));
      console.log(`[CALLBACK] onStart: DB update done in ${Date.now() - dbUpdateStart}ms`);

      // Get steps data for broadcast
      console.log(`[CALLBACK] onStart: Getting item for steps data...`);
      const getItemStart = Date.now();
      const item = await getItem(taskId);
      console.log(`[CALLBACK] onStart: getItem done in ${Date.now() - getItemStart}ms`);
      const steps = item?.stepsData?.steps ?? [];
      console.log(`[CALLBACK] onStart: Steps count: ${steps.length}`);

      console.log(`[CALLBACK] onStart: Broadcasting itemStarted...`);
      const broadcastStart = Date.now();
      AutomationBroadcaster.itemStarted(
        runId,
        taskId,
        task.flowKey,
        task.leadId,
        steps.map((s) => ({ id: s.id, name: s.name }))
      );
      console.log(`[CALLBACK] onStart: Broadcast done in ${Date.now() - broadcastStart}ms`);
      console.log(`[CALLBACK] onStart: TOTAL TIME: ${Date.now() - callbackStart}ms`);
    },
    onComplete: async (taskId, result) => {
      console.log(`[CALLBACK] onComplete called for task ${taskId.substring(0, 8)}...`);
      const callbackStart = Date.now();

      // Check if already cancelled - don't overwrite
      console.log(`[CALLBACK] onComplete: Checking if cancelled...`);
      const existingItem = await db
        .select({ status: schema.runItems.status })
        .from(schema.runItems)
        .where(eq(schema.runItems.id, taskId))
        .limit(1);

      if (existingItem[0]?.status === "cancelled") {
        console.log(`[CALLBACK] onComplete: Already cancelled, skipping`);
        return; // Don't overwrite cancelled status
      }

      // Check if this was an aborted flow
      if (result.aborted) {
        console.log(`[CALLBACK] onComplete: Aborted flow, skipping`);
        return; // Don't update, cancel() already handled it
      }

      // Update item status
      console.log(`[CALLBACK] onComplete: Updating DB status...`);
      await db
        .update(schema.runItems)
        .set({
          status: result.success ? "completed" : "failed",
          completedAt: new Date(),
          errorMessage: result.error?.message ?? null,
        })
        .where(eq(schema.runItems.id, taskId));

      console.log(`[CALLBACK] onComplete: Broadcasting...`);
      AutomationBroadcaster.itemCompleted(
        runId,
        taskId,
        result.success,
        result.totalDuration
      );
      console.log(`[CALLBACK] onComplete: TOTAL TIME: ${Date.now() - callbackStart}ms`);
    },
    onError: async (taskId, error) => {
      console.log(`[CALLBACK] onError called for task ${taskId.substring(0, 8)}...`);
      console.log(`[CALLBACK] onError: Error message: ${error.message}`);

      await db
        .update(schema.runItems)
        .set({
          status: "failed",
          completedAt: new Date(),
          errorMessage: error.message,
        })
        .where(eq(schema.runItems.id, taskId));

      AutomationBroadcaster.itemFailed(runId, taskId, error.message);
      console.log(`[CALLBACK] onError: Done`);
    },
    onWaitingUser: async (taskId, result) => {
      console.log(`[CALLBACK] onWaitingUser called for task ${taskId.substring(0, 8)}...`);
      console.log(`[CALLBACK] onWaitingUser: Stopped at step: ${result.stoppedAtStep}`);

      // Update item status to waiting_user
      await db
        .update(schema.runItems)
        .set({ status: "waiting_user" })
        .where(eq(schema.runItems.id, taskId));

      // Broadcast waiting_user event
      AutomationBroadcaster.itemWaitingUser(runId, taskId, result.stoppedAtStep ?? "unknown");
      console.log(`[CALLBACK] onWaitingUser: Done`);
    },
    onManualComplete: async (taskId) => {
      console.log(`[CALLBACK] onManualComplete called for task ${taskId.substring(0, 8)}...`);

      // Get item to calculate duration
      const item = await getItem(taskId);
      const startedAt = item?.startedAt ? new Date(item.startedAt).getTime() : Date.now();
      const duration = Date.now() - startedAt;

      // Update item status to completed (user closed browser = success)
      await db
        .update(schema.runItems)
        .set({
          status: "completed",
          completedAt: new Date(),
        })
        .where(eq(schema.runItems.id, taskId));

      // Broadcast completion
      AutomationBroadcaster.itemCompleted(runId, taskId, true, duration);
      console.log(`[CALLBACK] onManualComplete: Done`);
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
      const waitingCount = items.filter((i) => i.status === "waiting_user").length;

      // If any items are still waiting_user, run stays "running"
      // If any failed/cancelled, run is "failed"
      // Otherwise run is "done"
      let finalStatus: "running" | "failed" | "done";
      if (waitingCount > 0) {
        finalStatus = "running"; // Run is not finished yet
      } else if (failedCount > 0) {
        finalStatus = "failed";
      } else {
        finalStatus = "done";
      }

      console.log("\n========================================");
      console.log("RUN COMPLETION");
      console.log("========================================");
      console.log(`Run ID: ${runId}`);
      console.log(`Total tasks: ${items.length}`);
      console.log(`Failed/Cancelled: ${failedCount}`);
      console.log(`Waiting for user: ${waitingCount}`);
      console.log(`Final status: ${finalStatus.toUpperCase()}`);
      console.log("========================================\n");

      // Atomic update: only update status if not already cancelled
      await db
        .update(schema.runs)
        .set({ status: finalStatus })
        .where(and(eq(schema.runs.id, runId), ne(schema.runs.status, "cancelled")));

      // Only broadcast run completed if no items are waiting for user
      if (waitingCount === 0) {
        AutomationBroadcaster.runCompleted(runId, failedCount === 0);
      }
    })
    .catch((error) => {
      console.error(`Pool execution failed for run ${runId}:`, error);
    });

  // Return immediately so the UI can navigate to the live view
  return { runId, result: null };
}

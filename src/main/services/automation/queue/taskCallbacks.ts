import { db, schema } from "@/main/db";
import { eq } from "drizzle-orm";
import { AutomationBroadcaster } from "../../automationBroadcaster";
import { getItem } from "../itemManager";
import type { FlowTask } from "@/main/flows/engine";
import type { TaskCallbacks } from "@/main/flows/engine/pool/types/global";

/**
 * Create TaskCallbacks for the global pool.
 */
export function createTaskCallbacks(
  runId: string,
  tasks: FlowTask[]
): TaskCallbacks {
  return {
    onStart: async (taskId) => {
      console.log(`[CALLBACK] onStart called for task ${taskId.substring(0, 8)}...`);
      const callbackStart = Date.now();

      const task = tasks.find((t) => t.id === taskId);
      if (!task) {
        console.log(`[CALLBACK] onStart: Task not found!`);
        return;
      }

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
      console.log(`[CALLBACK] onStart: TOTAL TIME: ${Date.now() - callbackStart}ms`);
    },

    onComplete: async (taskId, result) => {
      console.log(`[CALLBACK] onComplete called for task ${taskId.substring(0, 8)}...`);

      // Check if already cancelled - don't overwrite
      const existingItem = await db
        .select({ status: schema.runItems.status })
        .from(schema.runItems)
        .where(eq(schema.runItems.id, taskId))
        .limit(1);

      if (existingItem[0]?.status === "cancelled") {
        console.log(`[CALLBACK] onComplete: Already cancelled, skipping`);
        return;
      }

      if (result.aborted) {
        console.log(`[CALLBACK] onComplete: Aborted flow, skipping`);
        return;
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
      console.log(`[CALLBACK] onError called for task ${taskId.substring(0, 8)}...`);

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

    onWaitingUser: async (taskId, result) => {
      console.log(`[CALLBACK] onWaitingUser called for task ${taskId.substring(0, 8)}...`);

      await db
        .update(schema.runItems)
        .set({ status: "waiting_user" })
        .where(eq(schema.runItems.id, taskId));

      AutomationBroadcaster.itemWaitingUser(runId, taskId, result.stoppedAtStep ?? "unknown");
    },

    onManualComplete: async (taskId) => {
      console.log(`[CALLBACK] onManualComplete called for task ${taskId.substring(0, 8)}...`);

      const item = await getItem(taskId);
      const startedAt = item?.startedAt ? new Date(item.startedAt).getTime() : Date.now();
      const duration = Date.now() - startedAt;

      await db
        .update(schema.runItems)
        .set({
          status: "completed",
          completedAt: new Date(),
        })
        .where(eq(schema.runItems.id, taskId));

      AutomationBroadcaster.itemCompleted(runId, taskId, true, duration);
    },
  };
}

import { db, schema } from "@/main/db";
import { eq } from "drizzle-orm";
import { AutomationBroadcaster } from "../../../automationBroadcaster";
import type { FlowResult } from "@/main/flows/engine";

export async function onComplete(runId: string, taskId: string, result: FlowResult): Promise<void> {
  console.log(`[CALLBACK] onComplete called for task ${taskId.substring(0, 8)}...`);

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

  await db
    .update(schema.runItems)
    .set({
      status: result.success ? "completed" : "failed",
      completedAt: new Date(),
      errorMessage: result.error?.message ?? null,
    })
    .where(eq(schema.runItems.id, taskId));

  AutomationBroadcaster.itemCompleted(runId, taskId, result.success, result.totalDuration);
}

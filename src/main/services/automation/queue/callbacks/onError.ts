import { db, schema } from "@/main/db";
import { eq } from "drizzle-orm";
import { AutomationBroadcaster } from "../../../automationBroadcaster";

export async function onError(runId: string, taskId: string, error: Error): Promise<void> {
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
}

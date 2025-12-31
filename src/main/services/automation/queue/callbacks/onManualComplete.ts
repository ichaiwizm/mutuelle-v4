import { db, schema } from "@/main/db";
import { eq } from "drizzle-orm";
import { AutomationBroadcaster } from "../../../automationBroadcaster";
import { getItem } from "../../itemManager";

export async function onManualComplete(runId: string, taskId: string): Promise<void> {
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
}

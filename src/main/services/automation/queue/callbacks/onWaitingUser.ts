import { db, schema } from "@/main/db";
import { eq } from "drizzle-orm";
import { AutomationBroadcaster } from "../../../automationBroadcaster";
import type { FlowResult } from "@/main/flows/engine";

export async function onWaitingUser(runId: string, taskId: string, result: FlowResult): Promise<void> {
  console.log(`[CALLBACK] onWaitingUser called for task ${taskId.substring(0, 8)}...`);

  await db
    .update(schema.runItems)
    .set({ status: "waiting_user" })
    .where(eq(schema.runItems.id, taskId));

  AutomationBroadcaster.itemWaitingUser(runId, taskId, result.stoppedAtStep ?? "unknown");
}

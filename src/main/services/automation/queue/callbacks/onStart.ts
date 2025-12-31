import { db, schema } from "@/main/db";
import { eq } from "drizzle-orm";
import { AutomationBroadcaster } from "../../../automationBroadcaster";
import { getItem } from "../../itemManager";
import type { FlowTask } from "@/main/flows/engine";

export async function onStart(runId: string, tasks: FlowTask[], taskId: string): Promise<void> {
  console.log(`[CALLBACK] onStart called for task ${taskId.substring(0, 8)}...`);
  const callbackStart = Date.now();

  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    console.log(`[CALLBACK] onStart: Task not found!`);
    return;
  }

  await db
    .update(schema.runItems)
    .set({ status: "running", startedAt: new Date() })
    .where(eq(schema.runItems.id, taskId));

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
}

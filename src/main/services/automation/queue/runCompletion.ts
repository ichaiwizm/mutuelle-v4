import { db, schema } from "@/main/db";
import { eq, and, ne } from "drizzle-orm";
import { AutomationBroadcaster } from "../../automationBroadcaster";

/**
 * Handle run completion - calculate final status and broadcast.
 */
export async function handleRunCompletion(runId: string): Promise<void> {
  // Get all items for this run
  const items = await db
    .select({ status: schema.runItems.status })
    .from(schema.runItems)
    .where(eq(schema.runItems.runId, runId));

  const failedCount = items.filter(
    (i) => i.status === "failed" || i.status === "cancelled"
  ).length;
  const waitingCount = items.filter((i) => i.status === "waiting_user").length;

  // Determine final status
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
}

/**
 * Handle empty run (no valid tasks).
 */
export async function handleEmptyRun(runId: string): Promise<void> {
  console.log(
    `[RUN_ERROR] Run ${runId} | No valid tasks to execute (all transformations failed or no flows selected)`
  );

  await db
    .update(schema.runs)
    .set({ status: "failed" })
    .where(eq(schema.runs.id, runId));
}

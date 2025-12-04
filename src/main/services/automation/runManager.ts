import { db, schema } from "@/main/db";
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { GlobalFlowPool } from "@/main/flows/engine/pool/GlobalFlowPool";
import { LeadsService } from "../leadsService";
import { NotFoundError } from "@/shared/errors";
import { AutomationBroadcaster } from "../automationBroadcaster";
import { formatLeadName, mapRunItem } from "./utils";
import type { Run, RunStatus, RunWithItems } from "./types";

/**
 * Get a run by ID with its items.
 * Items are enriched with leadName (Prénom NOM format).
 */
export async function getRun(runId: string): Promise<RunWithItems | null> {
  const runs = await db
    .select()
    .from(schema.runs)
    .where(eq(schema.runs.id, runId));

  if (runs.length === 0) return null;

  const items = await db
    .select()
    .from(schema.runItems)
    .where(eq(schema.runItems.runId, runId));

  // Fetch leads to enrich items with leadName
  const leadIds = items.map((item) => item.leadId);
  const leadsMap = await LeadsService.getByIds(leadIds);

  return {
    ...runs[0],
    status: runs[0].status as RunStatus,
    items: items.map((item) => {
      const lead = leadsMap.get(item.leadId);
      const leadName = formatLeadName(lead?.subscriber);
      return mapRunItem(item, leadName);
    }),
  };
}

/**
 * Get a run by ID, throws if not found.
 */
export async function getRunOrThrow(runId: string): Promise<RunWithItems> {
  const run = await getRun(runId);
  if (!run) {
    throw new NotFoundError("Run", runId);
  }
  return run;
}

/**
 * List runs with pagination.
 */
export async function listRuns(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ runs: Run[]; total: number }> {
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const [runs, countResult] = await Promise.all([
    db
      .select({
        id: schema.runs.id,
        status: schema.runs.status,
        createdAt: schema.runs.createdAt,
        itemsCount: sql<number>`(SELECT COUNT(*) FROM run_items WHERE run_items.run_id = runs.id)`,
        failedCount: sql<number>`(SELECT COUNT(*) FROM run_items WHERE run_items.run_id = runs.id AND run_items.status IN ('failed', 'cancelled'))`,
      })
      .from(schema.runs)
      .orderBy(desc(schema.runs.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(schema.runs),
  ]);

  return {
    runs: runs.map((r) => ({
      ...r,
      status: r.status as RunStatus,
      itemsCount: Number(r.itemsCount) || 0,
      failedCount: Number(r.failedCount) || 0,
    })),
    total: Number(countResult[0]?.count) || 0,
  };
}

/**
 * Cancel a running automation.
 * Returns true if cancelled, false if already completed.
 */
export async function cancelRun(runId: string): Promise<{ cancelled: boolean }> {
  const run = await getRun(runId);
  if (!run) {
    throw new NotFoundError("Run", runId);
  }

  // Already done
  if (
    run.status === "done" ||
    run.status === "failed" ||
    run.status === "cancelled"
  ) {
    return { cancelled: false };
  }

  const cancellationTime = new Date();

  // Cancel the run in the global pool (removes pending tasks, aborts running ones)
  await GlobalFlowPool.getInstance().cancelRun(runId);

  // Update run status
  await db
    .update(schema.runs)
    .set({ status: "cancelled" })
    .where(eq(schema.runs.id, runId));

  // Mark only queued/running items as cancelled (don't touch completed/failed)
  await db
    .update(schema.runItems)
    .set({ status: "cancelled", completedAt: cancellationTime })
    .where(
      and(
        eq(schema.runItems.runId, runId),
        inArray(schema.runItems.status, ["queued", "running"])
      )
    );

  // Broadcast cancellation
  AutomationBroadcaster.runCancelled(runId);

  return { cancelled: true };
}

/**
 * Delete a run and all its items.
 * Cannot delete running or queued runs.
 */
export async function deleteRun(runId: string): Promise<{ deleted: boolean }> {
  const run = await getRun(runId);
  if (!run) {
    throw new NotFoundError("Run", runId);
  }

  // Cannot delete running or queued runs
  if (run.status === "running" || run.status === "queued") {
    throw new Error("Cannot delete a running or queued run");
  }

  // Delete items first (foreign key constraint)
  await db.delete(schema.runItems).where(eq(schema.runItems.runId, runId));

  // Delete run
  await db.delete(schema.runs).where(eq(schema.runs.id, runId));

  return { deleted: true };
}

/**
 * Clean up all running/queued runs on app shutdown.
 * This ensures runs don't stay "running" forever in DB when app closes.
 */
export async function cleanupOnShutdown(): Promise<void> {
  // 1. Shutdown the global pool (cancels all runs, closes browser)
  await GlobalFlowPool.getInstance().shutdown();

  const cancellationTime = new Date();

  // 2. Update DB: mark all running/queued runs as cancelled
  await db
    .update(schema.runs)
    .set({ status: "cancelled" })
    .where(inArray(schema.runs.status, ["running", "queued"]));

  // 3. Update DB: mark all running/queued/waiting_user items as cancelled
  await db
    .update(schema.runItems)
    .set({ status: "cancelled", completedAt: cancellationTime })
    .where(inArray(schema.runItems.status, ["running", "queued", "waiting_user"]));

  console.log("[SHUTDOWN] Cleaned up running/queued/waiting_user runs");
}

/**
 * Clean up orphaned runs on app startup.
 * If app crashed or was killed, runs may still be in 'running' or 'queued' state.
 * This function marks them as 'failed' so the UI shows the correct status.
 */
export async function cleanupOrphanedRuns(): Promise<void> {
  console.log("[STARTUP] Checking for orphaned runs...");

  // Check if there are any orphaned runs
  const orphanedRuns = await db
    .select({ id: schema.runs.id })
    .from(schema.runs)
    .where(inArray(schema.runs.status, ["running", "queued"]));

  if (orphanedRuns.length === 0) {
    console.log("[STARTUP] No orphaned runs found");
    return;
  }

  console.log(`[STARTUP] Found ${orphanedRuns.length} orphaned run(s), marking as failed...`);

  const cleanupTime = new Date();

  // Mark runs as failed (they were interrupted by crash/kill)
  await db
    .update(schema.runs)
    .set({ status: "failed" })
    .where(inArray(schema.runs.status, ["running", "queued"]));

  // Mark their items as cancelled with error message
  await db
    .update(schema.runItems)
    .set({
      status: "cancelled",
      completedAt: cleanupTime,
      errorMessage: "Run interrupted by app crash or restart",
    })
    .where(inArray(schema.runItems.status, ["running", "queued"]));

  // Mark waiting_user items as failed (browser session was lost)
  await db
    .update(schema.runItems)
    .set({
      status: "failed",
      completedAt: cleanupTime,
      errorMessage: "Session navigateur perdue (redémarrage de l'application)",
    })
    .where(eq(schema.runItems.status, "waiting_user"));

  console.log("[STARTUP] Orphaned runs cleanup complete");
}

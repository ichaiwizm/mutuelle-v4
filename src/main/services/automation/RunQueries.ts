import { db, schema } from "@/main/db";
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { LeadsService } from "../leadsService";
import { formatLeadName, mapRunItem } from "./utils";
import type { Run, RunStatus, RunWithItems } from "./types";

export async function getRun(runId: string): Promise<RunWithItems | null> {
  const runs = await db.select().from(schema.runs).where(eq(schema.runs.id, runId));
  if (runs.length === 0) return null;
  const items = await db.select().from(schema.runItems).where(eq(schema.runItems.runId, runId));
  const leadIds = items.map(item => item.leadId);
  const leadsMap = await LeadsService.getByIds(leadIds);
  return {
    ...runs[0],
    status: runs[0].status as RunStatus,
    items: items.map(item => {
      const lead = leadsMap.get(item.leadId);
      return mapRunItem(item, formatLeadName(lead?.subscriber));
    }),
  };
}

export async function listRuns(options?: { limit?: number; offset?: number }): Promise<{ runs: Run[]; total: number }> {
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;
  const [runs, countResult] = await Promise.all([
    db.select({
      id: schema.runs.id,
      status: schema.runs.status,
      createdAt: schema.runs.createdAt,
      itemsCount: sql<number>`(SELECT COUNT(*) FROM run_items WHERE run_items.run_id = runs.id)`,
      failedCount: sql<number>`(SELECT COUNT(*) FROM run_items WHERE run_items.run_id = runs.id AND run_items.status IN ('failed', 'cancelled'))`,
    }).from(schema.runs).orderBy(desc(schema.runs.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(schema.runs),
  ]);
  return {
    runs: runs.map(r => ({ ...r, status: r.status as RunStatus, itemsCount: Number(r.itemsCount) || 0, failedCount: Number(r.failedCount) || 0 })),
    total: Number(countResult[0]?.count) || 0,
  };
}

export async function updateRunStatus(runId: string, status: string): Promise<void> {
  await db.update(schema.runs).set({ status }).where(eq(schema.runs.id, runId));
}

export async function updateItemsStatus(runId: string, fromStatuses: string[], toStatus: string, completedAt: Date, errorMessage?: string): Promise<void> {
  const updates: Record<string, unknown> = { status: toStatus, completedAt };
  if (errorMessage) updates.errorMessage = errorMessage;
  await db.update(schema.runItems).set(updates).where(and(eq(schema.runItems.runId, runId), inArray(schema.runItems.status, fromStatuses)));
}

export async function deleteRunItems(runId: string): Promise<void> {
  await db.delete(schema.runItems).where(eq(schema.runItems.runId, runId));
}

export async function deleteRun(runId: string): Promise<void> {
  await db.delete(schema.runs).where(eq(schema.runs.id, runId));
}

export async function getOrphanedRunIds(): Promise<string[]> {
  const runs = await db.select({ id: schema.runs.id }).from(schema.runs).where(inArray(schema.runs.status, ["running", "queued"]));
  return runs.map(r => r.id);
}

export async function markRunsAsFailed(statuses: string[]): Promise<void> {
  await db.update(schema.runs).set({ status: "failed" }).where(inArray(schema.runs.status, statuses));
}

export async function markItemsAsCancelled(statuses: string[], completedAt: Date, errorMessage: string): Promise<void> {
  await db.update(schema.runItems).set({ status: "cancelled", completedAt, errorMessage }).where(inArray(schema.runItems.status, statuses));
}

export async function markWaitingUserAsFailed(completedAt: Date, errorMessage: string): Promise<void> {
  await db.update(schema.runItems).set({ status: "failed", completedAt, errorMessage }).where(eq(schema.runItems.status, "waiting_user"));
}

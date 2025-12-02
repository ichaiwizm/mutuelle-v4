import { db, schema } from "@/main/db";
import { eq } from "drizzle-orm";
import { LeadsService } from "../leadsService";
import { NotFoundError } from "@/shared/errors";
import { formatLeadName, mapRunItem } from "./utils";
import { getRunOrThrow } from "./runManager";
import { enqueueRun } from "./queueManager";
import type { RunItem } from "@/shared/types/run";

/**
 * Get a single run item by ID.
 * Item is enriched with leadName (Prénom NOM format).
 */
export async function getItem(itemId: string): Promise<RunItem | null> {
  const items = await db
    .select()
    .from(schema.runItems)
    .where(eq(schema.runItems.id, itemId));

  if (items.length === 0) return null;

  // Fetch lead to enrich item with leadName
  const lead = await LeadsService.get(items[0].leadId);
  const leadName = formatLeadName(lead?.subscriber);
  return mapRunItem(items[0], leadName);
}

/**
 * Retry failed/cancelled items from a run by creating a new run.
 */
export async function retryRun(runId: string): Promise<{ newRunId: string }> {
  const originalRun = await getRunOrThrow(runId);

  // Filter failed/cancelled items
  const failedItems = originalRun.items.filter(
    (item) => item.status === "failed" || item.status === "cancelled"
  );

  if (failedItems.length === 0) {
    throw new Error("No failed or cancelled items to retry");
  }

  // Create new items for enqueue
  const retryItems = failedItems.map((item) => ({
    flowKey: item.flowKey,
    leadId: item.leadId,
  }));

  // Enqueue creates a new run
  const result = await enqueueRun(retryItems);
  return { newRunId: result.runId };
}

/**
 * Retry a single failed/cancelled item by creating a new run.
 */
export async function retryItem(itemId: string): Promise<{ newRunId: string }> {
  const item = await getItem(itemId);
  if (!item) {
    throw new NotFoundError("RunItem", itemId);
  }

  if (item.status !== "failed" && item.status !== "cancelled") {
    throw new Error("Only failed or cancelled items can be retried");
  }

  // Create a new run with just this item
  const result = await enqueueRun([
    {
      flowKey: item.flowKey,
      leadId: item.leadId,
    },
  ]);

  return { newRunId: result.runId };
}

import { db, schema } from "../db";
import { eq, desc, sql, and, ne, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join, basename } from "node:path";
import { FlowPool } from "../flows/engine";
import { LeadsService } from "./leadsService";
import { getUserDataDir } from "@/main/env";
import { NotFoundError } from "@/shared/errors";
import { transformLeadForFlow, hasTransformerForFlow } from "../flows/transformers";
import { AutomationBroadcaster } from "./automationBroadcaster";
import { getProductConfig } from "./productConfig/productConfigCore";
import type { FlowTask } from "../flows/engine";
import type { FlowHooks } from "../flows/engine/types/hooks";
import type { StepProgressData, StepProgress } from "@/shared/types/step-progress";
import type { RunItem } from "@/shared/types/run";

function artifactsRoot() {
  return join(getUserDataDir(), "artifacts");
}

// Track active pools by runId for cancellation
const activePools = new Map<string, FlowPool>();

export type RunStatus = "queued" | "running" | "done" | "failed" | "cancelled";

export type Run = {
  id: string;
  status: RunStatus;
  createdAt: Date;
};

export type RunWithItems = Run & {
  items: RunItem[];
};

/**
 * Parse stepsData JSON from database
 */
function parseStepsData(stepsDataJson: string | null): StepProgressData | null {
  if (!stepsDataJson) return null;
  try {
    return JSON.parse(stepsDataJson) as StepProgressData;
  } catch {
    return null;
  }
}

/**
 * Format lead name as "Prénom NOM" from subscriber data
 */
function formatLeadName(subscriber: Record<string, unknown> | undefined): string | undefined {
  if (!subscriber) return undefined;
  const prenom = subscriber.prenom as string | undefined;
  const nom = subscriber.nom as string | undefined;
  if (!prenom && !nom) return undefined;
  const formattedPrenom = prenom || "";
  const formattedNom = nom ? nom.toUpperCase() : "";
  return `${formattedPrenom} ${formattedNom}`.trim() || undefined;
}

/**
 * Map a database row to RunItem type
 */
function mapRunItem(row: typeof schema.runItems.$inferSelect, leadName?: string): RunItem {
  return {
    id: row.id,
    runId: row.runId,
    flowKey: row.flowKey,
    leadId: row.leadId,
    leadName,
    status: row.status,
    artifactsDir: row.artifactsDir,
    stepsData: parseStepsData(row.stepsData ?? null),
    startedAt: row.startedAt ?? null,
    completedAt: row.completedAt ?? null,
    errorMessage: row.errorMessage ?? null,
  };
}

/**
 * Update steps data in database
 */
async function updateItemStepsData(itemId: string, stepsData: StepProgressData): Promise<void> {
  await db
    .update(schema.runItems)
    .set({ stepsData: JSON.stringify(stepsData) })
    .where(eq(schema.runItems.id, itemId));
}

/**
 * Create flow hooks for broadcasting and persisting step progress
 */
function createProgressHooks(
  runId: string,
  itemId: string,
  stepsData: StepProgressData
): FlowHooks {
  return {
    beforeStep: async (context, stepDef) => {
      const stepIndex = stepsData.steps.findIndex((s) => s.id === stepDef.id);
      if (stepIndex !== -1) {
        stepsData.steps[stepIndex].status = "running";
        stepsData.steps[stepIndex].startedAt = Date.now();
        stepsData.currentStepIndex = stepIndex;

        // Broadcast and persist
        AutomationBroadcaster.stepStarted(runId, itemId, stepDef.id, stepIndex);
        await updateItemStepsData(itemId, stepsData);
      }
    },

    afterStep: async (context, stepDef, result) => {
      const stepIndex = stepsData.steps.findIndex((s) => s.id === stepDef.id);
      if (stepIndex !== -1) {
        const step = stepsData.steps[stepIndex];
        step.status = result.success ? "completed" : "failed";
        step.completedAt = Date.now();
        step.duration = result.duration;
        step.retries = result.retries;

        if (!result.success && result.error) {
          step.error = result.error.message;
        }

        // Extract screenshot path from artifacts if present
        const screenshotPath = result.metadata?.screenshotPath as string | undefined;
        if (screenshotPath) {
          step.screenshot = screenshotPath;
        }

        // Broadcast and persist
        if (result.success) {
          AutomationBroadcaster.stepCompleted(
            runId,
            itemId,
            stepDef.id,
            stepIndex,
            result.duration,
            screenshotPath
          );
        } else {
          AutomationBroadcaster.stepFailed(
            runId,
            itemId,
            stepDef.id,
            stepIndex,
            result.error?.message ?? "Unknown error",
            screenshotPath
          );
        }

        await updateItemStepsData(itemId, stepsData);
      }
    },

    onSkip: async (context, stepDef, reason) => {
      const stepIndex = stepsData.steps.findIndex((s) => s.id === stepDef.id);
      if (stepIndex !== -1) {
        stepsData.steps[stepIndex].status = "skipped";

        AutomationBroadcaster.stepSkipped(runId, itemId, stepDef.id, stepIndex, reason);
        await updateItemStepsData(itemId, stepsData);
      }
    },

    onError: async (context, error, stepDef) => {
      if (stepDef) {
        const stepIndex = stepsData.steps.findIndex((s) => s.id === stepDef.id);
        if (stepIndex !== -1) {
          stepsData.steps[stepIndex].status = "failed";
          stepsData.steps[stepIndex].error = error.message;
        }
      }
    },
  };
}

export const AutomationService = {
  /**
   * Get a run by ID with its items.
   * Items are enriched with leadName (Prénom NOM format).
   */
  async get(runId: string): Promise<RunWithItems | null> {
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
  },

  /**
   * Get a single run item by ID.
   * Item is enriched with leadName (Prénom NOM format).
   */
  async getItem(itemId: string): Promise<RunItem | null> {
    const items = await db
      .select()
      .from(schema.runItems)
      .where(eq(schema.runItems.id, itemId));

    if (items.length === 0) return null;

    // Fetch lead to enrich item with leadName
    const lead = await LeadsService.get(items[0].leadId);
    const leadName = formatLeadName(lead?.subscriber);
    return mapRunItem(items[0], leadName);
  },

  /**
   * Get a run by ID, throws if not found.
   */
  async getOrThrow(runId: string): Promise<RunWithItems> {
    const run = await this.get(runId);
    if (!run) {
      throw new NotFoundError("Run", runId);
    }
    return run;
  },

  /**
   * List runs with pagination.
   */
  async list(options?: { limit?: number; offset?: number }): Promise<{
    runs: Run[];
    total: number;
  }> {
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
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.runs),
    ]);

    return {
      runs: runs.map(r => ({
        ...r,
        status: r.status as RunStatus,
        itemsCount: Number(r.itemsCount) || 0,
        failedCount: Number(r.failedCount) || 0,
      })),
      total: Number(countResult[0]?.count) || 0,
    };
  },

  /**
   * Cancel a running automation.
   * Returns true if cancelled, false if already completed.
   */
  async cancel(runId: string): Promise<{ cancelled: boolean }> {
    const run = await this.get(runId);
    if (!run) {
      throw new NotFoundError("Run", runId);
    }

    // Already done
    if (run.status === "done" || run.status === "failed" || run.status === "cancelled") {
      return { cancelled: false };
    }

    const cancellationTime = new Date();

    // Abort the pool if running (this actually stops execution)
    const pool = activePools.get(runId);
    if (pool) {
      await pool.abort();
      activePools.delete(runId);
    }

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
  },

  /**
   * Delete a run and all its items.
   * Cannot delete running or queued runs.
   */
  async delete(runId: string): Promise<{ deleted: boolean }> {
    const run = await this.get(runId);
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
  },

  /**
   * Retry failed/cancelled items from a run by creating a new run.
   */
  async retry(runId: string): Promise<{ newRunId: string }> {
    const originalRun = await this.getOrThrow(runId);

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
    const result = await this.enqueue(retryItems);
    return { newRunId: result.runId };
  },

  /**
   * Retry a single failed/cancelled item by creating a new run.
   */
  async retryItem(itemId: string): Promise<{ newRunId: string }> {
    const item = await this.getItem(itemId);
    if (!item) {
      throw new NotFoundError("RunItem", itemId);
    }

    if (item.status !== "failed" && item.status !== "cancelled") {
      throw new Error("Only failed or cancelled items can be retried");
    }

    // Create a new run with just this item
    const result = await this.enqueue([{
      flowKey: item.flowKey,
      leadId: item.leadId,
    }]);

    return { newRunId: result.runId };
  },

  /**
   * Enqueue flows for parallel execution
   */
  async enqueue(
    items: Array<{ flowKey: string; leadId: string }>,
    options?: { maxConcurrent?: number }
  ) {
    const runId = randomUUID();
    const now = new Date();

    await db.insert(schema.runs).values({
      id: runId,
      status: "queued",
      createdAt: now,
    });

    const tasks: FlowTask[] = [];

    for (const item of items) {
      const lead = await LeadsService.getById(item.leadId);
      if (!lead) {
        console.warn(`Lead ${item.leadId} not found, skipping`);
        continue;
      }

      const itemId = randomUUID();
      const dir = join(artifactsRoot(), runId, itemId);
      await mkdir(dir, { recursive: true });

      // Transform lead data for the flow (if transformer exists)
      let transformedData: unknown;
      if (hasTransformerForFlow(item.flowKey)) {
        try {
          transformedData = transformLeadForFlow(item.flowKey, lead);
        } catch (error) {
          console.log(`[TRANSFORM_ERROR] Lead ${item.leadId.substring(0, 8)}... | Flow: ${item.flowKey} | Error: ${error instanceof Error ? error.message : String(error)}`);
          // Persist a failed run item so the UI sees the failure explicitly
          await db.insert(schema.runItems).values({
            id: itemId,
            runId,
            flowKey: item.flowKey,
            leadId: item.leadId,
            status: "failed",
            artifactsDir: dir,
            errorMessage: error instanceof Error ? error.message : String(error),
          });
          continue;
        }
      }

      // Get product config to extract step definitions
      const productConfig = getProductConfig(item.flowKey);
      const stepDefs = productConfig?.steps ?? [];

      // Initialize steps data
      const stepsData: StepProgressData = {
        steps: stepDefs.map((s) => ({
          id: s.id,
          name: s.name,
          status: "pending" as const,
        })),
        totalSteps: stepDefs.length,
        currentStepIndex: 0,
      };

      // Insert run item with initial steps data
      await db.insert(schema.runItems).values({
        id: itemId,
        runId,
        flowKey: item.flowKey,
        leadId: item.leadId,
        status: "queued",
        artifactsDir: dir,
        stepsData: JSON.stringify(stepsData),
      });

      // Create hooks for this specific task
      const hooks = createProgressHooks(runId, itemId, stepsData);

      tasks.push({
        id: itemId,
        flowKey: item.flowKey,
        leadId: item.leadId,
        lead,
        transformedData,
        artifactsDir: dir,
        flowConfig: {
          enablePauseResume: true,
          hooks,
        },
      });
    }

    if (tasks.length === 0) {
      console.log(`[RUN_ERROR] Run ${runId} | No valid tasks to execute (all transformations failed or no flows selected)`);

      await db
        .update(schema.runs)
        .set({ status: "failed" })
        .where(eq(schema.runs.id, runId));
      return { runId, result: null };
    }

    const pool = new FlowPool({
      maxConcurrent: options?.maxConcurrent ?? 3,
      onTaskStart: async (taskId) => {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;

        // Update item status to running
        await db
          .update(schema.runItems)
          .set({ status: "running", startedAt: new Date() })
          .where(eq(schema.runItems.id, taskId));

        // Get steps data for broadcast
        const item = await this.getItem(taskId);
        const steps = item?.stepsData?.steps ?? [];

        AutomationBroadcaster.itemStarted(
          runId,
          taskId,
          task.flowKey,
          task.leadId,
          steps.map((s) => ({ id: s.id, name: s.name }))
        );
      },
      onTaskComplete: async (taskId, result) => {
        // Check if already cancelled - don't overwrite
        const existingItem = await db
          .select({ status: schema.runItems.status })
          .from(schema.runItems)
          .where(eq(schema.runItems.id, taskId))
          .limit(1);

        if (existingItem[0]?.status === "cancelled") {
          return; // Don't overwrite cancelled status
        }

        // Check if this was an aborted flow
        if (result.aborted) {
          return; // Don't update, cancel() already handled it
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

        AutomationBroadcaster.itemCompleted(runId, taskId, result.success, result.totalDuration);
      },
      onTaskError: async (taskId, error) => {
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
    });

    // Track pool for potential cancellation
    activePools.set(runId, pool);

    // Broadcast run started
    AutomationBroadcaster.runStarted(runId, tasks.length);

    // Enqueue tasks and start pool
    pool.enqueue(tasks);

    await db
      .update(schema.runs)
      .set({ status: "running" })
      .where(eq(schema.runs.id, runId));

    // Start pool execution in background (don't await!)
    // This allows the IPC call to return immediately
    pool.start().then(async (result) => {
      try {
        // Atomic update: only update status if not already cancelled
        const finalStatus = result.failed > 0 ? "failed" : "done";

        console.log('\n========================================');
        console.log('RUN COMPLETION');
        console.log('========================================');
        console.log(`Run ID: ${runId}`);
        console.log(`Total tasks: ${result.total}`);
        console.log(`Successful: ${result.successful}`);
        console.log(`Failed: ${result.failed}`);
        console.log(`Final status: ${finalStatus.toUpperCase()}`);
        console.log('========================================\n');

        await db
          .update(schema.runs)
          .set({ status: finalStatus })
          .where(and(
            eq(schema.runs.id, runId),
            ne(schema.runs.status, "cancelled")
          ));

        // Broadcast run completed
        AutomationBroadcaster.runCompleted(runId, result.failed === 0);
      } finally {
        // Always clean up tracking
        activePools.delete(runId);
      }
    }).catch((error) => {
      console.error(`Pool execution failed for run ${runId}:`, error);
      activePools.delete(runId);
    });

    // Return immediately so the UI can navigate to the live view
    return { runId, result: null };
  },

  /**
   * Clean up all running/queued runs on app shutdown.
   * This ensures runs don't stay "running" forever in DB when app closes.
   */
  async cleanupOnShutdown(): Promise<void> {
    // 1. Abort all active pools
    for (const [runId, pool] of activePools) {
      try {
        await pool.abort();
      } catch (e) {
        console.error(`Failed to abort pool for run ${runId}:`, e);
      }
    }
    activePools.clear();

    const cancellationTime = new Date();

    // 2. Update DB: mark all running/queued runs as cancelled
    await db
      .update(schema.runs)
      .set({ status: "cancelled" })
      .where(inArray(schema.runs.status, ["running", "queued"]));

    // 3. Update DB: mark all running/queued items as cancelled
    await db
      .update(schema.runItems)
      .set({ status: "cancelled", completedAt: cancellationTime })
      .where(inArray(schema.runItems.status, ["running", "queued"]));

    console.log("[SHUTDOWN] Cleaned up running/queued runs");
  },
};

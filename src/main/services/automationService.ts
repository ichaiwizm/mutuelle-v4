import { db, schema } from "../db";
import { eq, desc, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { FlowPool } from "../flows/engine";
import { LeadsService } from "./leadsService";
import { getUserDataDir } from "@/main/env";
import { NotFoundError } from "@/shared/errors";
import { transformLeadForFlow, hasTransformerForFlow } from "../flows/transformers";
import type { FlowTask } from "../flows/engine";

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

export type RunItem = {
  id: string;
  runId: string;
  flowKey: string;
  leadId: string;
  status: string;
  artifactsDir: string;
};

export type RunWithItems = Run & {
  items: RunItem[];
};

export const AutomationService = {
  /**
   * Get a run by ID with its items.
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

    return {
      ...runs[0],
      status: runs[0].status as RunStatus,
      items,
    };
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
        .select()
        .from(schema.runs)
        .orderBy(desc(schema.runs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.runs),
    ]);

    return {
      runs: runs.map(r => ({ ...r, status: r.status as RunStatus })),
      total: countResult[0]?.count ?? 0,
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

    // Stop the pool if running
    const pool = activePools.get(runId);
    if (pool) {
      pool.pauseAll();
      activePools.delete(runId);
    }

    // Update status
    await db
      .update(schema.runs)
      .set({ status: "cancelled" })
      .where(eq(schema.runs.id, runId));

    return { cancelled: true };
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
      const itemId = randomUUID();
      const dir = join(artifactsRoot(), runId, itemId);
      await mkdir(dir, { recursive: true });

      await db.insert(schema.runItems).values({
        id: itemId,
        runId,
        flowKey: item.flowKey,
        leadId: item.leadId,
        status: "queued",
        artifactsDir: dir,
      });

      const lead = await LeadsService.getById(item.leadId);
      if (!lead) {
        console.warn(`Lead ${item.leadId} not found, skipping`);
        continue;
      }

      // Transform lead data for the flow
      let transformedData: unknown;
      if (hasTransformerForFlow(item.flowKey)) {
        try {
          transformedData = transformLeadForFlow(item.flowKey, lead);
        } catch (error) {
          console.error(`Failed to transform lead ${item.leadId} for flow ${item.flowKey}:`, error);
          await db.update(schema.runItems)
            .set({ status: "failed" })
            .where(eq(schema.runItems.id, itemId));
          continue;
        }
      }

      tasks.push({
        id: itemId,
        flowKey: item.flowKey,
        leadId: item.leadId,
        lead,
        transformedData,
        artifactsDir: dir,
      });
    }

    if (tasks.length === 0) {
      await db.update(schema.runs)
        .set({ status: "failed" })
        .where(eq(schema.runs.id, runId));
      return { runId, result: null };
    }

    const pool = new FlowPool({
      maxConcurrent: options?.maxConcurrent ?? 3,
    });

    // Track pool for potential cancellation
    activePools.set(runId, pool);

    pool.enqueue(tasks);

    await db.update(schema.runs)
      .set({ status: "running" })
      .where(eq(schema.runs.id, runId));

    const result = await pool.start();

    // Clean up
    activePools.delete(runId);

    // Check if cancelled during execution
    const currentRun = await this.get(runId);
    if (currentRun?.status === "cancelled") {
      return { runId, result: null };
    }

    await db.update(schema.runs)
      .set({ status: result.failed > 0 ? "failed" : "done" })
      .where(eq(schema.runs.id, runId));

    return { runId, result };
  },
};

import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { FlowPool } from "../flows/engine";
import { LeadsService } from "./leadsService";
import { getUserDataDir } from "@/main/env";
import type { FlowTask } from "../flows/engine";

function artifactsRoot() {
  return join(getUserDataDir(), "artifacts");
}

export const AutomationService = {
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

      tasks.push({
        id: itemId,
        flowKey: item.flowKey,
        leadId: item.leadId,
        lead,
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

    pool.enqueue(tasks);

    await db.update(schema.runs)
      .set({ status: "running" })
      .where(eq(schema.runs.id, runId));

    const result = await pool.start();

    await db.update(schema.runs)
      .set({ status: result.failed > 0 ? "failed" : "done" })
      .where(eq(schema.runs.id, runId));

    return { runId, result };
  },
};

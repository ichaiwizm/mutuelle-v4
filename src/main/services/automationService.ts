import { db, schema } from "../db";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { app } from "electron";
import { Engine } from "../flows/engine";

function artifactsRoot() {
  return join(app.getPath("userData"), "artifacts");
}

export const AutomationService = {
  async enqueue(items: Array<{ flowKey: string; leadId: string }>) {
    const runId = randomUUID();
    const now = Date.now();

    await db.insert(schema.runs).values({ id: runId, status: "queued", createdAt: now });

    for (const it of items) {
      const itemId = randomUUID();
      const dir = join(artifactsRoot(), runId, itemId);
      await mkdir(dir, { recursive: true });

      await db.insert(schema.runItems).values({
        id: itemId,
        runId,
        flowKey: it.flowKey,
        leadId: it.leadId,
        status: "queued",
        artifactsDir: dir,
      });
    }

    // Exécution immédiate, simple
    await Engine.runQueued();

    return { runId };
  },
};

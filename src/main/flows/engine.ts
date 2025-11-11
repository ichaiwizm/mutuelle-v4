import { db, schema } from "../db";
import { eq, and } from "drizzle-orm";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { app } from "electron";
import { Adapters } from "./adapters";
import { LeadSchema } from "@/shared/validation/lead.zod";

function artifactsRoot() {
  return join(app.getPath("userData"), "artifacts");
}
function platformForFlow(flowKey: string): "alptis" | "swisslife" | undefined {
  if (flowKey.startsWith("alptis")) return "alptis";
  if (flowKey.startsWith("swisslife")) return "swisslife";
}

export const Engine = {
  async runQueued() {
    const queued = await db.select().from(schema.runItems).where(eq(schema.runItems.status, "queued"));

    for (const item of queued) {
      // -> running
      await db
        .update(schema.runItems)
        .set({ status: "running" })
        .where(eq(schema.runItems.id, item.id));
      await db
        .update(schema.runs)
        .set({ status: "running" })
        .where(eq(schema.runs.id, item.runId));

      const flowKey = item.flowKey;
      const adapter = Adapters[flowKey];
      const platform = platformForFlow(flowKey);

      try {
        if (!adapter) throw new Error(`No adapter for flow ${flowKey}`);
        if (!platform) throw new Error(`No platform mapping for ${flowKey}`);

        // lead
        const [leadRow] = await db.select().from(schema.leads).where(eq(schema.leads.id, item.leadId));
        if (!leadRow) throw new Error(`Lead ${item.leadId} not found`);
        const lead = LeadSchema.parse(JSON.parse(leadRow.data));

        // creds
        const [creds] = await db.select().from(schema.credentials).where(eq(schema.credentials.platform, platform));
        if (!creds) throw new Error(`Credentials for ${platform} missing`);

        // artifacts dir
        const dir = join(artifactsRoot(), item.runId, item.id);
        await mkdir(dir, { recursive: true });

        // exec
        await adapter.execute(lead, { login: creds.login, password: creds.password }, { artifactsDir: dir });

        // -> done pour l'item
        await db
          .update(schema.runItems)
          .set({ status: "done" })
          .where(eq(schema.runItems.id, item.id));

        // Recalcule l'état global du run
        const all = await db
          .select({ status: schema.runItems.status })
          .from(schema.runItems)
          .where(eq(schema.runItems.runId, item.runId));

        const hasFailed = all.some((r) => r.status === "failed");
        const allDone = all.every((r) => r.status === "done");

        await db
          .update(schema.runs)
          .set({ status: hasFailed ? "failed" : allDone ? "done" : "running" })
          .where(eq(schema.runs.id, item.runId));
      } catch (e) {
        await db
          .update(schema.runItems)
          .set({ status: "failed" })
          .where(eq(schema.runItems.id, item.id));
        await db.update(schema.runs).set({ status: "failed" }).where(eq(schema.runs.id, item.runId));
        console.error("Engine error", { item, error: e });
      }
    }
  },
};

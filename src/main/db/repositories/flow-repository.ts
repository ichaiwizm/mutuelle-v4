import { db, schema } from "../index";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID, createHash } from "node:crypto";

export type Flow = typeof schema.flowDefinitions.$inferSelect;
export type FlowInsert = typeof schema.flowDefinitions.$inferInsert;
export type FlowVersion = typeof schema.flowVersions.$inferSelect;

const checksum = (content: string) => createHash("sha256").update(content).digest("hex");

export const FlowRepository = {
  /** Get all flow definitions. */
  getAll(): Flow[] {
    return db.select().from(schema.flowDefinitions).orderBy(desc(schema.flowDefinitions.createdAt)).all();
  },

  /** Get a flow definition by flowKey (returns the latest version). */
  getByFlowKey(flowKey: string): Flow | null {
    const rows = db.select().from(schema.flowDefinitions)
      .where(eq(schema.flowDefinitions.flowKey, flowKey))
      .orderBy(desc(schema.flowDefinitions.createdAt)).limit(1).all();
    return rows[0] ?? null;
  },

  /** Get active flow definition by flowKey. */
  getActiveByFlowKey(flowKey: string): Flow | null {
    const rows = db.select().from(schema.flowDefinitions)
      .where(and(eq(schema.flowDefinitions.flowKey, flowKey), eq(schema.flowDefinitions.status, "active")))
      .limit(1).all();
    return rows[0] ?? null;
  },

  /** Create a new flow definition. */
  create(flow: Omit<FlowInsert, "id" | "checksum" | "createdAt" | "updatedAt">): Flow {
    const now = new Date();
    const id = randomUUID();
    db.insert(schema.flowDefinitions)
      .values({ ...flow, id, checksum: checksum(flow.yamlContent), createdAt: now, updatedAt: now }).run();
    return this.getByFlowKey(flow.flowKey)!;
  },

  /** Update an existing flow definition. */
  update(id: string, flow: Partial<Omit<FlowInsert, "id" | "createdAt">>): Flow {
    const updates: Record<string, unknown> = { ...flow, updatedAt: new Date() };
    if (flow.yamlContent) updates.checksum = checksum(flow.yamlContent);
    db.update(schema.flowDefinitions).set(updates).where(eq(schema.flowDefinitions.id, id)).run();
    return db.select().from(schema.flowDefinitions).where(eq(schema.flowDefinitions.id, id)).all()[0]!;
  },

  /** Publish a flow: create version record and set status to active. */
  publish(flowKey: string, yamlContent: string, version: string): Flow {
    const existing = this.getByFlowKey(flowKey);
    if (!existing) throw new Error(`Flow not found: ${flowKey}`);
    const now = new Date();
    db.insert(schema.flowVersions)
      .values({ id: randomUUID(), flowId: existing.id, version, yamlContent, checksum: checksum(yamlContent), createdAt: now }).run();
    return this.update(existing.id, { yamlContent, version, status: "active" });
  },

  /** Get version history for a flow. */
  getVersionHistory(flowKey: string): FlowVersion[] {
    const flow = this.getByFlowKey(flowKey);
    if (!flow) return [];
    return db.select().from(schema.flowVersions)
      .where(eq(schema.flowVersions.flowId, flow.id))
      .orderBy(desc(schema.flowVersions.createdAt)).all();
  },
};

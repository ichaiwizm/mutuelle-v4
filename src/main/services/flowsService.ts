import { db, schema } from "../db";

export const FlowsService = {
  async list() {
    const rows = await db.select().from(schema.flows);
    return rows.map((r) => ({ key: r.key, version: r.version, title: r.title }));
  },
};


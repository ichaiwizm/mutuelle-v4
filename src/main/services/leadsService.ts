import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const LeadsService = {
  async list() {
    const rows = await db.select({ id: schema.leads.id }).from(schema.leads);
    return rows.map((r) => ({ id: r.id }));
  },

  async create(raw: unknown) {
    // id facultatif à l’entrée → on le force
    const withId =
      typeof raw === "object" && raw
        ? { id: (raw as any).id ?? randomUUID(), ...(raw as any) }
        : { id: randomUUID(), subscriber: {} };

    const lead = withId as any;
    if (typeof lead.id !== 'string' || !UUID_RE.test(lead.id)) throw new Error('Invalid lead: id');
    if (typeof lead.subscriber !== 'object' || !lead.subscriber) throw new Error('Invalid lead: subscriber');
    const now = new Date();

    await db.insert(schema.leads).values({
      id: lead.id,
      data: JSON.stringify(lead),
      createdAt: now,
      updatedAt: now,
    });

    return { id: lead.id };
  },

  async remove(id: string) {
    await db.delete(schema.leads).where(eq(schema.leads.id, id));
  },
};

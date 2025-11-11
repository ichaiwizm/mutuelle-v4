import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import { LeadSchema } from "@/shared/validation/lead.zod";
import { randomUUID } from "node:crypto";

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

    const lead = LeadSchema.parse(withId);
    const now = Date.now();

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

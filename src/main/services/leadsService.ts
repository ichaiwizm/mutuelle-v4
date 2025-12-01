import { db, schema } from "../db";
import { eq, desc, sql, like, or } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { NotFoundError, ValidationError } from "@/shared/errors";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type Lead = {
  id: string;
  subscriber: Record<string, unknown>;
  project?: Record<string, unknown>;
  children?: Array<Record<string, unknown>>;
};

export type LeadRow = {
  id: string;
  data: string;
  createdAt: Date;
  updatedAt: Date;
};

export const LeadsService = {
  /**
   * List all leads with optional pagination and search.
   */
  async list(options?: { limit?: number; offset?: number; search?: string }): Promise<LeadRow[]> {
    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;
    const search = options?.search?.trim();

    let query = db
      .select()
      .from(schema.leads)
      .orderBy(desc(schema.leads.createdAt))
      .limit(limit)
      .offset(offset);

    // Search in the JSON data field (nom, prenom)
    if (search) {
      query = query.where(like(schema.leads.data, `%${search}%`)) as typeof query;
    }

    const rows = await query;
    return rows;
  },

  /**
   * Count total number of leads.
   */
  async count(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.leads);
    return result[0]?.count ?? 0;
  },

  /**
   * Get a lead by ID.
   * Returns the parsed lead data or null if not found.
   */
  async get(id: string): Promise<Lead | null> {
    if (!UUID_RE.test(id)) {
      throw new ValidationError("Invalid lead ID format");
    }

    const rows = await db
      .select()
      .from(schema.leads)
      .where(eq(schema.leads.id, id));

    if (rows.length === 0) return null;
    return JSON.parse(rows[0].data) as Lead;
  },

  /**
   * Get a lead by ID, throws if not found.
   */
  async getOrThrow(id: string): Promise<Lead> {
    const lead = await this.get(id);
    if (!lead) {
      throw new NotFoundError("Lead", id);
    }
    return lead;
  },

  /**
   * Alias for get (backwards compatibility).
   */
  async getById(id: string): Promise<Lead | null> {
    return this.get(id);
  },

  /**
   * Create a new lead.
   * Returns { id, duplicate: true } if lead already exists (skipped).
   */
  async create(raw: unknown): Promise<{ id: string; duplicate?: boolean }> {
    // id facultatif à l'entrée → on le force
    const withId =
      typeof raw === "object" && raw
        ? { id: (raw as Record<string, unknown>).id ?? randomUUID(), ...(raw as Record<string, unknown>) }
        : { id: randomUUID(), subscriber: {} };

    const lead = withId as Lead;
    if (typeof lead.id !== "string" || !UUID_RE.test(lead.id)) {
      throw new ValidationError("Invalid lead: id must be a valid UUID");
    }
    if (typeof lead.subscriber !== "object" || !lead.subscriber) {
      throw new ValidationError("Invalid lead: subscriber is required");
    }

    // Check if lead already exists (for duplicate detection)
    const existing = await db.select({ id: schema.leads.id })
      .from(schema.leads)
      .where(eq(schema.leads.id, lead.id))
      .limit(1);

    if (existing.length > 0) {
      return { id: lead.id, duplicate: true };
    }

    const now = new Date();
    await db.insert(schema.leads).values({
      id: lead.id,
      data: JSON.stringify(lead),
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing();

    return { id: lead.id };
  },

  /**
   * Update an existing lead.
   * Merges the provided data with existing lead data.
   */
  async update(
    id: string,
    data: Partial<Pick<Lead, "subscriber" | "project" | "children">>
  ): Promise<void> {
    const existing = await this.get(id);
    if (!existing) {
      throw new NotFoundError("Lead", id);
    }

    const updated: Lead = {
      ...existing,
      ...(data.subscriber && { subscriber: { ...existing.subscriber, ...data.subscriber } }),
      ...(data.project !== undefined && { project: data.project }),
      ...(data.children !== undefined && { children: data.children }),
    };

    await db
      .update(schema.leads)
      .set({
        data: JSON.stringify(updated),
        updatedAt: new Date(),
      })
      .where(eq(schema.leads.id, id));
  },

  /**
   * Remove a lead by ID.
   */
  async remove(id: string): Promise<void> {
    if (!UUID_RE.test(id)) {
      throw new ValidationError("Invalid lead ID format");
    }
    await db.delete(schema.leads).where(eq(schema.leads.id, id));
  },

  /**
   * Delete all leads.
   */
  async deleteAll(): Promise<void> {
    await db.delete(schema.leads);
  },
};

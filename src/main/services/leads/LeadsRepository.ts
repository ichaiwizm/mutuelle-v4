import { db, schema } from "@/main/db";
import { eq, desc, sql, like, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { Lead, LeadRow } from "./types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(id: string): boolean {
  return UUID_RE.test(id);
}

export async function listLeads(options?: { limit?: number; offset?: number; search?: string }): Promise<LeadRow[]> {
  const { limit = 100, offset = 0, search } = options ?? {};
  let query = db.select().from(schema.leads).orderBy(desc(schema.leads.createdAt)).limit(limit).offset(offset);
  if (search?.trim()) query = query.where(like(schema.leads.data, `%${search.trim()}%`)) as typeof query;
  return query;
}

export async function countLeads(): Promise<number> {
  const result = await db.select({ count: sql<number>`count(*)` }).from(schema.leads);
  return result[0]?.count ?? 0;
}

export async function findById(id: string): Promise<LeadRow | null> {
  const rows = await db.select().from(schema.leads).where(eq(schema.leads.id, id));
  return rows[0] ?? null;
}

export async function findByIds(ids: string[]): Promise<LeadRow[]> {
  const validIds = ids.filter(isValidUUID);
  if (validIds.length === 0) return [];
  return db.select().from(schema.leads).where(inArray(schema.leads.id, validIds));
}

export async function checkExists(id: string): Promise<boolean> {
  const rows = await db.select({ id: schema.leads.id }).from(schema.leads).where(eq(schema.leads.id, id)).limit(1);
  return rows.length > 0;
}

export async function insertLead(lead: Lead): Promise<void> {
  const now = new Date();
  await db.insert(schema.leads).values({ id: lead.id, data: JSON.stringify(lead), createdAt: now, updatedAt: now }).onConflictDoNothing();
}

export async function updateLead(id: string, data: string): Promise<void> {
  await db.update(schema.leads).set({ data, updatedAt: new Date() }).where(eq(schema.leads.id, id));
}

export async function deleteLead(id: string): Promise<void> {
  await db.delete(schema.leads).where(eq(schema.leads.id, id));
}

export async function deleteAllLeads(): Promise<void> {
  await db.delete(schema.leads);
}

export function generateId(): string {
  return randomUUID();
}

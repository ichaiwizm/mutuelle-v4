import { db, schema } from "@/main/db";
import { eq, desc, sql, and, inArray, gte, lte, like } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { DevisFilters, CreateDevisInput } from "@/shared/types/devis";
import type { DevisRow } from "@/shared/ipc/contracts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(id: string): boolean {
  return UUID_RE.test(id);
}

function buildConditions(filters?: DevisFilters) {
  const conditions: ReturnType<typeof eq>[] = [];
  if (filters?.status) conditions.push(eq(schema.devis.status, filters.status));
  if (filters?.flowKey) conditions.push(eq(schema.devis.flowKey, filters.flowKey));
  if (filters?.dateFrom) conditions.push(gte(schema.devis.createdAt, new Date(filters.dateFrom)));
  if (filters?.dateTo) conditions.push(lte(schema.devis.createdAt, new Date(filters.dateTo)));
  if (filters?.search) conditions.push(like(schema.devis.data, `%${filters.search}%`));
  return conditions;
}

export async function listDevis(options?: { limit?: number; offset?: number; filters?: DevisFilters }): Promise<DevisRow[]> {
  const { limit = 100, offset = 0, filters } = options ?? {};
  const conditions = buildConditions(filters);
  let query = db.select().from(schema.devis).orderBy(desc(schema.devis.createdAt)).limit(limit).offset(offset);
  if (conditions.length > 0) query = query.where(and(...conditions)) as typeof query;
  return query;
}

export async function countDevis(filters?: DevisFilters): Promise<number> {
  const conditions = buildConditions(filters);
  let query = db.select({ count: sql<number>`count(*)` }).from(schema.devis);
  if (conditions.length > 0) query = query.where(and(...conditions)) as typeof query;
  const result = await query;
  return result[0]?.count ?? 0;
}

export async function findById(id: string): Promise<DevisRow | null> {
  const rows = await db.select().from(schema.devis).where(eq(schema.devis.id, id));
  return rows[0] ?? null;
}

export async function findByLeadId(leadId: string): Promise<DevisRow[]> {
  return db.select().from(schema.devis).where(eq(schema.devis.leadId, leadId)).orderBy(desc(schema.devis.createdAt));
}

export async function insert(input: CreateDevisInput): Promise<string> {
  const id = randomUUID();
  const now = new Date();
  await db.insert(schema.devis).values({ id, leadId: input.leadId, flowKey: input.flowKey, status: "pending", createdAt: now, updatedAt: now });
  return id;
}

export async function update(id: string, data: Record<string, unknown>): Promise<void> {
  await db.update(schema.devis).set({ ...data, updatedAt: new Date() }).where(eq(schema.devis.id, id));
}

export async function remove(id: string): Promise<void> {
  await db.delete(schema.devis).where(eq(schema.devis.id, id));
}

export async function duplicate(existing: DevisRow): Promise<string> {
  const id = randomUUID();
  const now = new Date();
  await db.insert(schema.devis).values({ id, leadId: existing.leadId, flowKey: existing.flowKey, status: "pending", data: existing.data, notes: existing.notes, createdAt: now, updatedAt: now });
  return id;
}

export async function countByLeadIds(leadIds: string[]): Promise<Record<string, number>> {
  const validIds = leadIds.filter(isValidUUID);
  if (validIds.length === 0) return {};
  const rows = await db.select({ leadId: schema.devis.leadId, count: sql<number>`count(*)` }).from(schema.devis).where(inArray(schema.devis.leadId, validIds)).groupBy(schema.devis.leadId);
  return Object.fromEntries(rows.map(r => [r.leadId, r.count]));
}

export async function getStatusCounts(): Promise<{ status: string; count: number }[]> {
  return db.select({ status: schema.devis.status, count: sql<number>`count(*)` }).from(schema.devis).groupBy(schema.devis.status);
}

export async function getRecent(limit: number): Promise<DevisRow[]> {
  return db.select().from(schema.devis).orderBy(desc(schema.devis.createdAt)).limit(limit);
}

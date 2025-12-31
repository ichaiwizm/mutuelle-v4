/**
 * Lead Repository
 * Provides access to leads from the main app's database
 */
import { eq } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { getDb } from "./connection";

// Mirror the leads table schema from main app
const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  data: text("data").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export type LeadType = "solo" | "conjoint" | "enfants" | "famille";

export interface Lead {
  id: string;
  name: string;
  type: LeadType;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadFilters {
  type?: LeadType;
  limit?: number;
  search?: string;
}

function determineLeadType(data: Record<string, unknown>): LeadType {
  const hasConjoint = !!data.conjoint;
  const hasEnfants = Array.isArray(data.enfants) && data.enfants.length > 0;
  if (hasConjoint && hasEnfants) return "famille";
  if (hasConjoint) return "conjoint";
  if (hasEnfants) return "enfants";
  return "solo";
}

function buildLeadName(data: Record<string, unknown>): string {
  const firstName = (data.firstName as string) || "";
  const lastName = (data.lastName as string) || "";
  return `${firstName} ${lastName}`.trim() || "Unknown";
}

function rowToLead(row: typeof leads.$inferSelect): Lead {
  const data = JSON.parse(row.data) as Record<string, unknown>;
  return {
    id: row.id,
    name: buildLeadName(data),
    type: determineLeadType(data),
    data,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function getAll(filters?: LeadFilters): Lead[] {
  const { db } = getDb();
  let query = db.select().from(leads);
  const rows = query.all();
  let result = rows.map(rowToLead);
  if (filters?.type) {
    result = result.filter((lead) => lead.type === filters.type);
  }
  if (filters?.search) {
    const search = filters.search.toLowerCase();
    result = result.filter((lead) => lead.name.toLowerCase().includes(search));
  }
  if (filters?.limit && filters.limit > 0) {
    result = result.slice(0, filters.limit);
  }
  return result;
}

export function getById(id: string): Lead | null {
  const { db } = getDb();
  const row = db.select().from(leads).where(eq(leads.id, id)).get();
  if (!row) return null;
  return rowToLead(row);
}

export function getByType(type: LeadType): Lead[] {
  return getAll({ type });
}

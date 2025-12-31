import { NotFoundError, ValidationError } from "@/shared/errors";
import * as Repo from "./LeadsRepository";
import type { Lead, LeadRow } from "./types";

function parseLead(row: LeadRow): Lead {
  return JSON.parse(row.data) as Lead;
}

export const LeadsService = {
  async list(options?: { limit?: number; offset?: number; search?: string }): Promise<LeadRow[]> {
    return Repo.listLeads(options);
  },

  async count(): Promise<number> {
    return Repo.countLeads();
  },

  async get(id: string): Promise<Lead | null> {
    if (!Repo.isValidUUID(id)) throw new ValidationError("Invalid lead ID format");
    const row = await Repo.findById(id);
    return row ? parseLead(row) : null;
  },

  async getOrThrow(id: string): Promise<Lead> {
    const lead = await this.get(id);
    if (!lead) throw new NotFoundError("Lead", id);
    return lead;
  },

  async getById(id: string): Promise<Lead | null> {
    return this.get(id);
  },

  async getByIds(ids: string[]): Promise<Map<string, Lead>> {
    if (ids.length === 0) return new Map();
    const rows = await Repo.findByIds(ids);
    const result = new Map<string, Lead>();
    for (const row of rows) {
      try { result.set(row.id, parseLead(row)); } catch { /* skip invalid */ }
    }
    return result;
  },

  async create(raw: unknown): Promise<{ id: string; duplicate?: boolean }> {
    const withId = typeof raw === "object" && raw
      ? { id: (raw as Record<string, unknown>).id ?? Repo.generateId(), ...(raw as Record<string, unknown>) }
      : { id: Repo.generateId(), subscriber: {} };
    const lead = withId as Lead;
    if (!Repo.isValidUUID(lead.id)) throw new ValidationError("Invalid lead: id must be a valid UUID");
    if (typeof lead.subscriber !== "object" || !lead.subscriber) throw new ValidationError("Invalid lead: subscriber is required");
    if (await Repo.checkExists(lead.id)) return { id: lead.id, duplicate: true };
    await Repo.insertLead(lead);
    return { id: lead.id };
  },

  async update(id: string, data: Partial<Pick<Lead, "subscriber" | "project" | "children">>): Promise<void> {
    const existing = await this.get(id);
    if (!existing) throw new NotFoundError("Lead", id);
    const updated: Lead = {
      ...existing,
      ...(data.subscriber && { subscriber: { ...existing.subscriber, ...data.subscriber } }),
      ...(data.project !== undefined && { project: data.project }),
      ...(data.children !== undefined && { children: data.children }),
    };
    await Repo.updateLead(id, JSON.stringify(updated));
  },

  async remove(id: string): Promise<void> {
    if (!Repo.isValidUUID(id)) throw new ValidationError("Invalid lead ID format");
    await Repo.deleteLead(id);
  },

  async deleteAll(): Promise<void> {
    await Repo.deleteAllLeads();
  },
};

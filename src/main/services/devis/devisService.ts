import { NotFoundError, ValidationError } from "@/shared/errors";
import type { Devis, DevisFilters, CreateDevisInput, UpdateDevisInput } from "@/shared/types/devis";
import type { DevisRow, DevisWithLead } from "@/shared/ipc/contracts";
import { LeadsService } from "../leadsService";
import { FlowsService } from "../flowsService";
import * as Repo from "./DevisRepository";
import * as Tx from "./DevisTransformer";

export const DevisService = {
  async list(options?: { limit?: number; offset?: number; filters?: DevisFilters }): Promise<DevisRow[]> {
    return Repo.listDevis(options);
  },

  async count(filters?: DevisFilters): Promise<number> {
    return Repo.countDevis(filters);
  },

  async listByLead(leadId: string): Promise<DevisWithLead[]> {
    if (!Repo.isValidUUID(leadId)) throw new ValidationError("Invalid lead ID format");
    const rows = await Repo.findByLeadId(leadId);
    if (rows.length === 0) return [];
    const lead = await LeadsService.get(leadId);
    const leadName = lead ? Tx.getLeadName(lead) : undefined;
    const flows = await FlowsService.list();
    const flowMap = new Map(flows.map(f => [f.key, f.title]));
    return rows.map(row => Tx.enrichWithLead(row, leadName, flowMap.get(row.flowKey)));
  },

  async get(id: string): Promise<Devis | null> {
    if (!Repo.isValidUUID(id)) throw new ValidationError("Invalid devis ID format");
    const row = await Repo.findById(id);
    return row ? Tx.parseRow(row) : null;
  },

  async getOrThrow(id: string): Promise<Devis> {
    const devis = await this.get(id);
    if (!devis) throw new NotFoundError("Devis", id);
    return devis;
  },

  async create(input: CreateDevisInput): Promise<{ id: string }> {
    if (!Repo.isValidUUID(input.leadId)) throw new ValidationError("Invalid lead ID format");
    const lead = await LeadsService.get(input.leadId);
    if (!lead) throw new NotFoundError("Lead", input.leadId);
    const flows = await FlowsService.list();
    if (!flows.some(f => f.key === input.flowKey)) throw new ValidationError(`Flow '${input.flowKey}' does not exist`);
    const id = await Repo.insert(input);
    return { id };
  },

  async update(id: string, data: UpdateDevisInput): Promise<{ updated: boolean }> {
    const existing = await this.get(id);
    if (!existing) throw new NotFoundError("Devis", id);
    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.data !== undefined) updateData.data = data.data ? JSON.stringify(data.data) : null;
    if (data.pdfPath !== undefined) updateData.pdfPath = data.pdfPath;
    if (data.errorMessage !== undefined) updateData.errorMessage = data.errorMessage;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    await Repo.update(id, updateData);
    return { updated: true };
  },

  async delete(id: string): Promise<{ deleted: boolean }> {
    if (!Repo.isValidUUID(id)) throw new ValidationError("Invalid devis ID format");
    const devis = await this.get(id);
    if (!devis) throw new NotFoundError("Devis", id);
    Tx.deletePdfFile(devis.pdfPath);
    await Repo.remove(id);
    return { deleted: true };
  },

  async exportPdf(id: string): Promise<{ success: boolean; exportedPath?: string }> {
    const devis = await this.getOrThrow(id);
    if (!devis.pdfPath) throw new ValidationError("Ce devis n'a pas de PDF associe");
    return Tx.exportPdfToPath(devis.pdfPath, id);
  },

  async duplicate(id: string): Promise<{ id: string }> {
    const existing = await Repo.findById(id);
    if (!existing) throw new NotFoundError("Devis", id);
    const newId = await Repo.duplicate(existing);
    return { id: newId };
  },

  async countByLead(leadIds: string[]): Promise<Record<string, number>> {
    return Repo.countByLeadIds(leadIds);
  },

  async stats(): Promise<{ total: number; pending: number; completed: number; failed: number; expired: number; recent: DevisWithLead[] }> {
    const statusCounts = await Repo.getStatusCounts();
    const counts = { total: 0, pending: 0, completed: 0, failed: 0, expired: 0 };
    for (const row of statusCounts) {
      counts.total += row.count;
      if (row.status === "pending") counts.pending = row.count;
      else if (row.status === "completed") counts.completed = row.count;
      else if (row.status === "failed") counts.failed = row.count;
      else if (row.status === "expired") counts.expired = row.count;
    }
    const recentRows = await Repo.getRecent(5);
    const leadIds = [...new Set(recentRows.map(r => r.leadId))];
    const leads = await LeadsService.getByIds(leadIds);
    const flows = await FlowsService.list();
    const flowMap = new Map(flows.map(f => [f.key, f.title]));
    const recent = recentRows.map(row => {
      const lead = leads.get(row.leadId);
      return Tx.enrichWithLead(row, lead ? Tx.getLeadName(lead) : undefined, flowMap.get(row.flowKey));
    });
    return { ...counts, recent };
  },

  generatePdfPath: Tx.generatePdfPath,
};

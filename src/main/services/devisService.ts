import { db, schema } from "../db";
import { eq, desc, sql, and, inArray, gte, lte, like } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { NotFoundError, ValidationError } from "@/shared/errors";
import { existsSync, unlinkSync, copyFileSync, mkdirSync } from "node:fs";
import { dialog, app } from "electron";
import { join } from "node:path";
import type {
  Devis,
  DevisData,
  DevisFilters,
  CreateDevisInput,
  UpdateDevisInput,
} from "@/shared/types/devis";
import type { DevisRow, DevisWithLead } from "@/shared/ipc/contracts";
import { LeadsService } from "./leadsService";
import { FlowsService } from "./flowsService";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Get the directory for storing devis PDFs
 */
function getDevisDir(): string {
  const dir = join(app.getPath("userData"), "devis");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Parse a database row into a Devis domain object
 */
function parseRow(row: DevisRow): Devis {
  return {
    id: row.id,
    leadId: row.leadId,
    flowKey: row.flowKey,
    status: row.status as Devis["status"],
    data: row.data ? (JSON.parse(row.data) as DevisData) : null,
    pdfPath: row.pdfPath,
    errorMessage: row.errorMessage,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    expiresAt: row.expiresAt,
  };
}

/**
 * Get lead name from subscriber data
 */
function getLeadName(lead: { subscriber: Record<string, unknown> }): string {
  const { prenom, nom } = lead.subscriber;
  if (prenom && nom) {
    return `${prenom} ${String(nom).toUpperCase()}`;
  }
  return String(nom || prenom || "Inconnu");
}

export const DevisService = {
  /**
   * List all devis with optional pagination and filters.
   */
  async list(options?: {
    limit?: number;
    offset?: number;
    filters?: DevisFilters;
  }): Promise<DevisRow[]> {
    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;
    const filters = options?.filters;

    const conditions: ReturnType<typeof eq>[] = [];

    if (filters?.status) {
      conditions.push(eq(schema.devis.status, filters.status));
    }
    if (filters?.flowKey) {
      conditions.push(eq(schema.devis.flowKey, filters.flowKey));
    }
    if (filters?.dateFrom) {
      conditions.push(gte(schema.devis.createdAt, new Date(filters.dateFrom)));
    }
    if (filters?.dateTo) {
      conditions.push(lte(schema.devis.createdAt, new Date(filters.dateTo)));
    }
    if (filters?.search) {
      // Search in data JSON field
      conditions.push(like(schema.devis.data, `%${filters.search}%`));
    }

    let query = db
      .select()
      .from(schema.devis)
      .orderBy(desc(schema.devis.createdAt))
      .limit(limit)
      .offset(offset);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    return await query;
  },

  /**
   * Count total number of devis with optional filters.
   */
  async count(filters?: DevisFilters): Promise<number> {
    const conditions: ReturnType<typeof eq>[] = [];

    if (filters?.status) {
      conditions.push(eq(schema.devis.status, filters.status));
    }
    if (filters?.flowKey) {
      conditions.push(eq(schema.devis.flowKey, filters.flowKey));
    }
    if (filters?.dateFrom) {
      conditions.push(gte(schema.devis.createdAt, new Date(filters.dateFrom)));
    }
    if (filters?.dateTo) {
      conditions.push(lte(schema.devis.createdAt, new Date(filters.dateTo)));
    }

    let query = db.select({ count: sql<number>`count(*)` }).from(schema.devis);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const result = await query;
    return result[0]?.count ?? 0;
  },

  /**
   * List all devis for a specific lead, enriched with lead and product info.
   */
  async listByLead(leadId: string): Promise<DevisWithLead[]> {
    if (!UUID_RE.test(leadId)) {
      throw new ValidationError("Invalid lead ID format");
    }

    const rows = await db
      .select()
      .from(schema.devis)
      .where(eq(schema.devis.leadId, leadId))
      .orderBy(desc(schema.devis.createdAt));

    if (rows.length === 0) {
      return [];
    }

    // Fetch lead info
    const lead = await LeadsService.get(leadId);
    const leadName = lead ? getLeadName(lead) : undefined;

    // Fetch all flows for product names
    const flows = await FlowsService.list();
    const flowMap = new Map(flows.map((f) => [f.key, f.title]));

    return rows.map((row) => ({
      ...parseRow(row),
      leadName,
      productName: flowMap.get(row.flowKey),
    }));
  },

  /**
   * Get a single devis by ID.
   */
  async get(id: string): Promise<Devis | null> {
    if (!UUID_RE.test(id)) {
      throw new ValidationError("Invalid devis ID format");
    }

    const rows = await db
      .select()
      .from(schema.devis)
      .where(eq(schema.devis.id, id));

    if (rows.length === 0) return null;
    return parseRow(rows[0]);
  },

  /**
   * Get a devis by ID, throws if not found.
   */
  async getOrThrow(id: string): Promise<Devis> {
    const devis = await this.get(id);
    if (!devis) {
      throw new NotFoundError("Devis", id);
    }
    return devis;
  },

  /**
   * Create a new devis with pending status.
   */
  async create(input: CreateDevisInput): Promise<{ id: string }> {
    if (!UUID_RE.test(input.leadId)) {
      throw new ValidationError("Invalid lead ID format");
    }

    // Verify lead exists
    const lead = await LeadsService.get(input.leadId);
    if (!lead) {
      throw new NotFoundError("Lead", input.leadId);
    }

    // Verify flow exists
    const flows = await FlowsService.list();
    const flowExists = flows.some((f) => f.key === input.flowKey);
    if (!flowExists) {
      throw new ValidationError(`Flow '${input.flowKey}' does not exist`);
    }

    const id = randomUUID();
    const now = new Date();

    await db.insert(schema.devis).values({
      id,
      leadId: input.leadId,
      flowKey: input.flowKey,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return { id };
  },

  /**
   * Update an existing devis.
   */
  async update(id: string, data: UpdateDevisInput): Promise<{ updated: boolean }> {
    const existing = await this.get(id);
    if (!existing) {
      throw new NotFoundError("Devis", id);
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.data !== undefined) {
      updateData.data = data.data ? JSON.stringify(data.data) : null;
    }
    if (data.pdfPath !== undefined) {
      updateData.pdfPath = data.pdfPath;
    }
    if (data.errorMessage !== undefined) {
      updateData.errorMessage = data.errorMessage;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }
    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    }

    await db
      .update(schema.devis)
      .set(updateData)
      .where(eq(schema.devis.id, id));

    return { updated: true };
  },

  /**
   * Delete a devis and its associated PDF file.
   */
  async delete(id: string): Promise<{ deleted: boolean }> {
    if (!UUID_RE.test(id)) {
      throw new ValidationError("Invalid devis ID format");
    }

    // Get devis to check for PDF
    const devis = await this.get(id);
    if (!devis) {
      throw new NotFoundError("Devis", id);
    }

    // Delete PDF file if exists
    if (devis.pdfPath && existsSync(devis.pdfPath)) {
      try {
        unlinkSync(devis.pdfPath);
      } catch {
        // Ignore file deletion errors
      }
    }

    await db.delete(schema.devis).where(eq(schema.devis.id, id));
    return { deleted: true };
  },

  /**
   * Export PDF to a user-selected location.
   */
  async exportPdf(id: string): Promise<{ success: boolean; exportedPath?: string }> {
    const devis = await this.getOrThrow(id);

    if (!devis.pdfPath) {
      throw new ValidationError("Ce devis n'a pas de PDF associé");
    }

    if (!existsSync(devis.pdfPath)) {
      throw new ValidationError("Le fichier PDF n'existe plus");
    }

    const { filePath, canceled } = await dialog.showSaveDialog({
      title: "Exporter le devis PDF",
      defaultPath: `devis-${id}.pdf`,
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });

    if (canceled || !filePath) {
      return { success: false };
    }

    copyFileSync(devis.pdfPath, filePath);
    return { success: true, exportedPath: filePath };
  },

  /**
   * Duplicate a devis (new ID, pending status, no PDF).
   */
  async duplicate(id: string): Promise<{ id: string }> {
    const existing = await this.getOrThrow(id);

    const newId = randomUUID();
    const now = new Date();

    await db.insert(schema.devis).values({
      id: newId,
      leadId: existing.leadId,
      flowKey: existing.flowKey,
      status: "pending",
      data: existing.data ? JSON.stringify(existing.data) : null,
      notes: existing.notes,
      createdAt: now,
      updatedAt: now,
    });

    return { id: newId };
  },

  /**
   * Count devis per lead for a list of lead IDs.
   */
  async countByLead(leadIds: string[]): Promise<Record<string, number>> {
    if (leadIds.length === 0) {
      return {};
    }

    // Filter valid UUIDs
    const validIds = leadIds.filter((id) => UUID_RE.test(id));
    if (validIds.length === 0) {
      return {};
    }

    const rows = await db
      .select({
        leadId: schema.devis.leadId,
        count: sql<number>`count(*)`,
      })
      .from(schema.devis)
      .where(inArray(schema.devis.leadId, validIds))
      .groupBy(schema.devis.leadId);

    const result: Record<string, number> = {};
    for (const row of rows) {
      result[row.leadId] = row.count;
    }
    return result;
  },

  /**
   * Get statistics for the dashboard widget.
   */
  async stats(): Promise<{
    total: number;
    pending: number;
    completed: number;
    failed: number;
    expired: number;
    recent: DevisWithLead[];
  }> {
    // Get counts by status
    const statusCounts = await db
      .select({
        status: schema.devis.status,
        count: sql<number>`count(*)`,
      })
      .from(schema.devis)
      .groupBy(schema.devis.status);

    const counts = {
      total: 0,
      pending: 0,
      completed: 0,
      failed: 0,
      expired: 0,
    };

    for (const row of statusCounts) {
      const count = row.count;
      counts.total += count;
      if (row.status === "pending") counts.pending = count;
      else if (row.status === "completed") counts.completed = count;
      else if (row.status === "failed") counts.failed = count;
      else if (row.status === "expired") counts.expired = count;
    }

    // Get 5 most recent devis
    const recentRows = await db
      .select()
      .from(schema.devis)
      .orderBy(desc(schema.devis.createdAt))
      .limit(5);

    // Enrich with lead and product info
    const leadIds = [...new Set(recentRows.map((r) => r.leadId))];
    const leads = await LeadsService.getByIds(leadIds);
    const flows = await FlowsService.list();
    const flowMap = new Map(flows.map((f) => [f.key, f.title]));

    const recent: DevisWithLead[] = recentRows.map((row) => {
      const lead = leads.get(row.leadId);
      return {
        ...parseRow(row),
        leadName: lead ? getLeadName(lead) : undefined,
        productName: flowMap.get(row.flowKey),
      };
    });

    return { ...counts, recent };
  },

  /**
   * Generate the PDF storage path for a devis.
   */
  generatePdfPath(id: string): string {
    return join(getDevisDir(), `${id}.pdf`);
  },
};

import { existsSync, unlinkSync, copyFileSync, mkdirSync } from "node:fs";
import { dialog, app } from "electron";
import { join } from "node:path";
import type { Devis, DevisData } from "@/shared/types/devis";
import type { DevisRow, DevisWithLead } from "@/shared/ipc/contracts";

export function getDevisDir(): string {
  const dir = join(app.getPath("userData"), "devis");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export function generatePdfPath(id: string): string {
  return join(getDevisDir(), `${id}.pdf`);
}

export function parseRow(row: DevisRow): Devis {
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

export function getLeadName(lead: { subscriber: Record<string, unknown> }): string {
  const { prenom, nom } = lead.subscriber;
  if (prenom && nom) return `${prenom} ${String(nom).toUpperCase()}`;
  return String(nom || prenom || "Inconnu");
}

export function enrichWithLead(row: DevisRow, leadName?: string, productName?: string): DevisWithLead {
  return { ...parseRow(row), leadName, productName };
}

export function deletePdfFile(pdfPath: string | null | undefined): void {
  if (pdfPath && existsSync(pdfPath)) {
    try { unlinkSync(pdfPath); } catch { /* ignore */ }
  }
}

export async function exportPdfToPath(sourcePath: string, devisId: string): Promise<{ success: boolean; exportedPath?: string }> {
  if (!existsSync(sourcePath)) throw new Error("Le fichier PDF n'existe plus");
  const { filePath, canceled } = await dialog.showSaveDialog({
    title: "Exporter le devis PDF",
    defaultPath: `devis-${devisId}.pdf`,
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });
  if (canceled || !filePath) return { success: false };
  copyFileSync(sourcePath, filePath);
  return { success: true, exportedPath: filePath };
}

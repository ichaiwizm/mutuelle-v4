/**
 * Devis (Quotes) Domain Types
 */

export type DevisStatus = "pending" | "completed" | "failed" | "expired";

export type DevisData = {
  monthlyPremium?: number;
  yearlyPremium?: number;
  coverageLevel?: string;
  formuleName?: string;
  effectiveDate?: string;
  [key: string]: unknown;
};

export type Devis = {
  id: string;
  leadId: string;
  flowKey: string;
  status: DevisStatus;
  data?: DevisData | null;
  pdfPath?: string | null;
  errorMessage?: string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  expiresAt?: Date | string | null;
};

export type DevisFilters = {
  status?: DevisStatus;
  flowKey?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};

export type CreateDevisInput = {
  leadId: string;
  flowKey: string;
};

export type UpdateDevisInput = Partial<
  Pick<Devis, "status" | "data" | "pdfPath" | "errorMessage" | "notes" | "expiresAt">
>;

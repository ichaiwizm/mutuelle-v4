/**
 * Lead types (from main application)
 */
export interface Lead {
  id: string;
  subscriber: Record<string, unknown>;
  project?: Record<string, unknown>;
  children?: Array<Record<string, unknown>>;
}

/**
 * Form data interface - matches HTML form structure
 * Dates are in HTML format (YYYY-MM-DD)
 */
export interface FormDataInput {
  // Personal information
  civilite: string;
  nom: string;
  prenom: string;
  dateNaissance: string;  // HTML date format: YYYY-MM-DD
  email: string;
  telephone: string;

  // Address
  adresse: string;
  codePostal: string;
  ville: string;

  // Professional
  profession: string;
  regimeSocial: string;

  // Family
  nombreEnfants: number;
  hasConjoint?: boolean;
  conjoint_dateNaissance?: string;  // HTML date format
  conjoint_profession?: string;
  conjoint_regimeSocial?: string;

  // Children (dynamic array)
  children?: Array<{
    dateNaissance: string;  // HTML date format
    order: number;
  }>;

  // Project/Coverage
  dateEffet: string;  // HTML date format
  actuellementAssure: boolean;
  soinsMedicaux: number;
  hospitalisation: number;
  optique: number;
  dentaire: number;
}

/**
 * Partial form data for testing
 */
export type PartialFormData = Partial<FormDataInput>;

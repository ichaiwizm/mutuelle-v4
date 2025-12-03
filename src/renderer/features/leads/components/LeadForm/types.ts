import type { Lead } from "@/shared/types/lead";

export interface LeadFormProps {
  lead?: Lead;
  onSubmit: (lead: Partial<Lead>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface FormData {
  // Subscriber
  civilite: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  codePostal: string;
  profession: string;
  regimeSocial: string;
  // Project
  dateEffet: string;
  // Conjoint (optional)
  hasConjoint: boolean;
  conjointDateNaissance: string;
  conjointProfession: string;
  conjointRegimeSocial: string;
  // Children
  children: { dateNaissance: string }[];
}

export interface FormErrors {
  civilite?: string;
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  codePostal?: string;
  profession?: string;
  regimeSocial?: string;
  dateEffet?: string;
  conjointDateNaissance?: string;
  children?: { dateNaissance?: string }[];
}

export const DATE_PATTERN = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
export const CODE_POSTAL_PATTERN = /^\d{5}$/;

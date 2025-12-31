/**
 * Transformer for Entoria Pack Famille flow
 * Handles lead data transformation and validation
 */
import type { PackFamilleFormData, TransformResult, TransformError } from './types';
import { DEFAULTS } from './types';
import { PROFESSION_MAPPING, DEFAULT_PROFESSION } from './profession-mappings';

/** Format date to DD/MM/YYYY */
export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

/** Get date effet (1st of next month) */
export function getDateEffet(): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const d = next.getDate().toString().padStart(2, '0');
  const m = (next.getMonth() + 1).toString().padStart(2, '0');
  return `${d}/${m}/${next.getFullYear()}`;
}

/** Check if date effet is valid */
export function isValidDateEffet(dateStr: string): boolean {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;
  const date = new Date(+parts[2], +parts[1] - 1, +parts[0]);
  const first = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  return date >= first;
}

/** Get departement from postal code */
export function getDepartement(codePostal: string | undefined): string {
  if (!codePostal) return DEFAULTS.departement_residence;
  if (codePostal.startsWith('97') || codePostal.startsWith('98')) {
    return codePostal.substring(0, 3);
  }
  return codePostal.substring(0, 2);
}

/** Map profession to Entoria dropdown value */
export function mapProfession(profession: string | undefined): string {
  if (!profession?.trim()) return DEFAULT_PROFESSION;
  const key = profession.toLowerCase().trim();
  return PROFESSION_MAPPING[key] || DEFAULT_PROFESSION;
}

/** Transform lead to form data */
export function transformLead(lead: Record<string, unknown>): PackFamilleFormData {
  const sub = (lead.subscriber || {}) as Record<string, unknown>;
  const proj = (lead.project || {}) as Record<string, unknown>;
  const children = (lead.children || []) as unknown[];

  let dateEffet = getDateEffet();
  if (proj.dateEffet) {
    const formatted = formatDate(proj.dateEffet as string);
    if (formatted && isValidDateEffet(formatted)) dateEffet = formatted;
  }

  return {
    profil: {
      date_naissance: formatDate(sub.dateNaissance as string),
      profession: mapProfession(sub.profession as string),
      exerce_en_tant_que: DEFAULTS.exerce_en_tant_que,
      departement_residence: getDepartement(sub.codePostal as string),
      assure_prevoyance_entoria: DEFAULTS.assure_prevoyance_entoria,
    },
    besoin: { hospitalisation_uniquement: DEFAULTS.hospitalisation_uniquement },
    garanties: {
      frequence_reglement: DEFAULTS.frequence_reglement,
      date_effet: dateEffet,
      avec_conjoint: !!proj.conjoint,
      avec_enfants: children.length > 0,
      formule_choisie: DEFAULTS.formule_choisie,
    },
  };
}

/** Transform with error handling */
export function transformLeadSafe(lead: Record<string, unknown>): TransformResult {
  try {
    return { success: true, data: transformLead(lead) };
  } catch (error) {
    const err: TransformError = {
      code: 'TRANSFORM_ERROR',
      message: error instanceof Error ? error.message : String(error),
      severity: 'critical',
    };
    return { success: false, errors: [err] };
  }
}

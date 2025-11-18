/**
 * Lead categorization and filtering
 */
import type { Lead } from '@/shared/types/lead';
import { mapProfession } from '@/main/flows/platforms/alptis/products/sante-select/transformers/mappers/profession-mapper';
import { requiresCadreExercice } from '@/main/flows/platforms/alptis/products/sante-select/transformers/mappers/cadre-exercice-mapper';
import {
  hasConjoint,
  getChildrenCount,
  getProfession,
  getRegimeType,
  getSubscriberName,
  getCivilite,
} from './leadAccessors';

/**
 * Lead with metadata for display
 */
export type CategorizedLead = {
  lead: Lead;
  index: number;
  metadata: {
    hasConjoint: boolean;
    childrenCount: number;
    requiresCadreExercice: boolean;
    profession: string;
    regimeType: 'SALARIE' | 'TNS_INDEPENDANT' | 'UNKNOWN';
    subscriberName: string;
    civilite: string;
  };
};

/**
 * Check if lead requires cadre exercice field
 */
export function leadRequiresCadreExercice(lead: Lead): boolean {
  try {
    const profession = getProfession(lead);
    if (!profession) return false;
    const mapped = mapProfession(profession);
    return requiresCadreExercice(mapped);
  } catch {
    return false;
  }
}

/**
 * Categorize a single lead with all metadata
 */
export function categorizeLead(lead: Lead, index: number): CategorizedLead {
  return {
    lead,
    index,
    metadata: {
      hasConjoint: hasConjoint(lead),
      childrenCount: getChildrenCount(lead),
      requiresCadreExercice: leadRequiresCadreExercice(lead),
      profession: getProfession(lead),
      regimeType: getRegimeType(lead),
      subscriberName: getSubscriberName(lead),
      civilite: getCivilite(lead),
    },
  };
}

/**
 * Categorize all leads
 */
export function categorizeLeads(leads: Lead[]): CategorizedLead[] {
  return leads.map((lead, index) => categorizeLead(lead, index));
}

/**
 * Filter criteria
 */
export type LeadFilterCriteria = {
  hasConjoint?: boolean;
  childrenCount?: number;
  requiresCadreExercice?: boolean;
  regimeType?: 'SALARIE' | 'TNS_INDEPENDANT';
};

/**
 * Filter leads by criteria
 */
export function filterLeads(leads: CategorizedLead[], criteria: LeadFilterCriteria): CategorizedLead[] {
  return leads.filter(({ metadata }) => {
    if (criteria.hasConjoint !== undefined && metadata.hasConjoint !== criteria.hasConjoint) return false;
    if (criteria.childrenCount !== undefined && metadata.childrenCount !== criteria.childrenCount) return false;
    if (criteria.requiresCadreExercice !== undefined && metadata.requiresCadreExercice !== criteria.requiresCadreExercice) return false;
    if (criteria.regimeType !== undefined && metadata.regimeType !== criteria.regimeType) return false;
    return true;
  });
}

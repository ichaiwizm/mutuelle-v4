/**
 * Universal lead categorization
 *
 * Provides categorization and filtering for leads across all platforms.
 * Platform-specific extensions should be added in platform directories.
 */
import type { Lead } from '@/shared/types/lead';
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
 *
 * Platform-specific metadata can be added via extension.
 */
export type CategorizedLead = {
  lead: Lead;
  index: number;
  metadata: {
    hasConjoint: boolean;
    childrenCount: number;
    profession: string;
    regimeType: 'SALARIE' | 'TNS_INDEPENDANT' | 'UNKNOWN';
    subscriberName: string;
    civilite: string;
  };
};

/**
 * Categorize a single lead with universal metadata
 *
 * @param lead - The lead to categorize
 * @param index - The index of the lead in the array
 * @returns Categorized lead with metadata
 */
export function categorizeLead(lead: Lead, index: number): CategorizedLead {
  return {
    lead,
    index,
    metadata: {
      hasConjoint: hasConjoint(lead),
      childrenCount: getChildrenCount(lead),
      profession: getProfession(lead),
      regimeType: getRegimeType(lead),
      subscriberName: getSubscriberName(lead),
      civilite: getCivilite(lead),
    },
  };
}

/**
 * Categorize all leads with universal metadata
 *
 * @param leads - Array of leads to categorize
 * @returns Array of categorized leads
 */
export function categorizeLeads(leads: Lead[]): CategorizedLead[] {
  return leads.map((lead, index) => categorizeLead(lead, index));
}

/**
 * Filter criteria for leads
 *
 * Platform-specific criteria can be added via extension.
 */
export type LeadFilterCriteria = {
  hasConjoint?: boolean;
  childrenCount?: number;
  regimeType?: 'SALARIE' | 'TNS_INDEPENDANT';
};

/**
 * Filter leads by criteria
 *
 * @param leads - Array of categorized leads to filter
 * @param criteria - Filter criteria
 * @returns Filtered array of categorized leads
 */
export function filterLeads(
  leads: CategorizedLead[],
  criteria: LeadFilterCriteria
): CategorizedLead[] {
  return leads.filter(({ metadata }) => {
    if (criteria.hasConjoint !== undefined && metadata.hasConjoint !== criteria.hasConjoint)
      return false;
    if (criteria.childrenCount !== undefined && metadata.childrenCount !== criteria.childrenCount)
      return false;
    if (criteria.regimeType !== undefined && metadata.regimeType !== criteria.regimeType)
      return false;
    return true;
  });
}

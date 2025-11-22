/**
 * Alptis-specific lead categorization
 *
 * Extends universal categorization with Alptis-specific fields (requiresCadreExercice).
 */
import type { Lead } from '@/shared/types/lead';
import {
  categorizeLead as baseCategorizeLead,
  categorizeLeads as baseCategorizeLeads,
  filterLeads as baseFilterLeads,
  type CategorizedLead as BaseCategorizedLead,
  type LeadFilterCriteria as BaseFilterCriteria,
} from '../../leads/leadCategorization';
import { mapProfession } from '@/main/flows/platforms/alptis/products/sante-select/transformers/mappers/profession-mapper';
import { requiresCadreExercice } from '@/main/flows/platforms/alptis/products/sante-select/transformers/mappers/cadre-exercice-mapper';
import { getProfession } from '../../leads';

/**
 * Alptis-specific categorized lead with additional metadata
 */
export type CategorizedLead = BaseCategorizedLead & {
  metadata: BaseCategorizedLead['metadata'] & {
    requiresCadreExercice: boolean; // ALPTIS-SPECIFIC
  };
};

/**
 * Check if lead requires cadre exercice field (ALPTIS-SPECIFIC)
 *
 * This is specific to Alptis Santé Select product requirements.
 *
 * @param lead - The lead to check
 * @returns True if the lead's profession requires cadre exercice field
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
 * Categorize a single lead with Alptis-specific metadata
 *
 * @param lead - The lead to categorize
 * @param index - The index of the lead in the array
 * @returns Categorized lead with Alptis-specific metadata
 */
export function categorizeLead(lead: Lead, index: number): CategorizedLead {
  const base = baseCategorizeLead(lead, index);
  return {
    ...base,
    metadata: {
      ...base.metadata,
      requiresCadreExercice: leadRequiresCadreExercice(lead),
    },
  };
}

/**
 * Categorize all leads with Alptis-specific metadata
 *
 * @param leads - Array of leads to categorize
 * @returns Array of categorized leads with Alptis-specific metadata
 */
export function categorizeLeads(leads: Lead[]): CategorizedLead[] {
  return leads.map((lead, index) => categorizeLead(lead, index));
}

/**
 * Alptis-specific filter criteria
 */
export type LeadFilterCriteria = BaseFilterCriteria & {
  requiresCadreExercice?: boolean;
};

/**
 * Filter leads by Alptis-specific criteria
 *
 * @param leads - Array of categorized leads to filter
 * @param criteria - Filter criteria (including Alptis-specific fields)
 * @returns Filtered array of categorized leads
 */
export function filterLeads(
  leads: CategorizedLead[],
  criteria: LeadFilterCriteria
): CategorizedLead[] {
  // First apply base filters (hasConjoint, childrenCount, regimeType)
  let filtered = baseFilterLeads(leads, criteria) as CategorizedLead[];

  // Then apply Alptis-specific filters
  if (criteria.requiresCadreExercice !== undefined) {
    filtered = filtered.filter(
      ({ metadata }) => metadata.requiresCadreExercice === criteria.requiresCadreExercice
    );
  }

  return filtered;
}

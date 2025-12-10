/**
 * Lead selector for Playwright tests
 *
 * Provides utilities for selecting and filtering leads based on family composition.
 * Implements strict filtering where each category is mutually exclusive.
 */

import type { Lead } from '@/shared/types/lead';
import type { LeadType } from './types';
import { LEAD_TYPE_NAMES } from './types';
import { loadAllLeads } from './loadLeads';
import { hasConjoint, getChildrenCount } from './leadFilters';
import { validateLead as validateSanteProPlusLead } from '@/main/flows/platforms/alptis/products/sante-pro-plus/transformers/validators/lead-validator';

export type ProductFilter = 'sante-pro-plus' | 'sante-select' | 'slsis' | undefined;

/**
 * Select a lead based on filtering criteria
 *
 * Filtering is strict and mutually exclusive:
 * - `solo`: No conjoint AND no children
 * - `conjoint`: Conjoint WITHOUT children
 * - `children`: Children WITHOUT conjoint
 * - `both`: Conjoint AND children
 * - `random`: No filtering
 *
 * @param type - The type of lead to select
 * @returns A randomly selected lead matching the criteria
 * @throws {Error} If no leads are available
 *
 * @example
 * ```typescript
 * const soloLead = selectLead('solo');
 * const familyLead = selectLead('both');
 * const anyLead = selectLead('random');
 * const santeProPlusLead = selectLead('random', 'sante-pro-plus');
 * ```
 */
export function selectLead(type: LeadType = 'random', productFilter?: ProductFilter): Lead {
  let allLeads = loadAllLeads();

  // Filtrer par éligibilité produit si spécifié
  if (productFilter === 'sante-pro-plus') {
    allLeads = allLeads.filter(lead => {
      const validation = validateSanteProPlusLead(lead);
      return validation.valid;
    });
  }

  if (allLeads.length === 0) {
    throw new Error(`No leads available${productFilter ? ` for product "${productFilter}"` : ''}`);
  }

  if (type === 'random') {
    return selectRandomLead(allLeads);
  }

  const filtered = filterLeadsByType(allLeads, type);

  if (filtered.length === 0) {
    console.warn(`⚠️  No lead found matching type "${type}"${productFilter ? ` for product "${productFilter}"` : ''}, falling back to random`);
    return selectRandomLead(allLeads);
  }

  return selectRandomLead(filtered);
}

/**
 * Filter leads by type using strict criteria
 *
 * @param leads - Array of leads to filter
 * @param type - Type to filter by
 * @returns Filtered array of leads
 */
function filterLeadsByType(leads: readonly Lead[], type: LeadType): Lead[] {
  return leads.filter((lead) => matchesLeadType(lead, type));
}

/**
 * Check if a lead matches the specified type
 *
 * Uses strict matching criteria where categories are mutually exclusive.
 *
 * @param lead - Lead to check
 * @param type - Type to match against
 * @returns True if the lead matches the type
 */
function matchesLeadType(lead: Lead, type: LeadType): boolean {
  const hasConj = hasConjoint(lead);
  const hasChild = getChildrenCount(lead) > 0;

  switch (type) {
    case 'solo':
      return !hasConj && !hasChild;
    case 'conjoint':
      return hasConj && !hasChild;
    case 'children':
      return !hasConj && hasChild;
    case 'both':
      return hasConj && hasChild;
    case 'random':
      return true;
    default:
      // Exhaustiveness check - TypeScript will error if a case is missing
      const _exhaustive: never = type;
      return false;
  }
}

/**
 * Select a random lead from the provided array
 *
 * @param leads - Array of leads to select from
 * @returns Randomly selected lead
 * @throws {Error} If array is empty
 */
function selectRandomLead(leads: readonly Lead[]): Lead {
  if (leads.length === 0) {
    throw new Error('Cannot select from empty lead array');
  }

  const index = Math.floor(Math.random() * leads.length);
  return leads[index];
}

/**
 * Get display name for a lead type
 *
 * Returns a human-readable name with emoji for use in logs and test descriptions.
 *
 * @param type - Lead type to get name for
 * @returns Display name with emoji
 *
 * @example
 * ```typescript
 * getLeadTypeName('solo');     // '🧍 Solo (sans conjoint ni enfants)'
 * getLeadTypeName('conjoint'); // '👫 Avec conjoint uniquement'
 * ```
 */
export function getLeadTypeName(type: LeadType): string {
  return LEAD_TYPE_NAMES[type] ?? 'Unknown';
}

/**
 * Get the total number of available leads
 *
 * @returns Total count of leads
 *
 * @example
 * ```typescript
 * const count = getLeadCount(); // 22
 * ```
 */
export function getLeadCount(): number {
  return loadAllLeads().length;
}

/**
 * Select a lead by its index in the leads array
 *
 * This is useful for interactive selection where the user chooses
 * a specific lead from a displayed list.
 *
 * @param index - Zero-based index of the lead to select (0 to getLeadCount()-1)
 * @returns The lead at the specified index
 * @throws {Error} If index is out of bounds
 *
 * @example
 * ```typescript
 * const lead = selectLeadByIndex(0);  // First lead
 * const lead = selectLeadByIndex(5);  // Sixth lead
 * ```
 */
export function selectLeadByIndex(index: number): Lead {
  const allLeads = loadAllLeads();

  if (index < 0 || index >= allLeads.length) {
    throw new Error(
      `Invalid lead index ${index}. Must be between 0 and ${allLeads.length - 1} (inclusive)`
    );
  }

  return allLeads[index];
}

// Re-export LeadType for convenience
export type { LeadType };

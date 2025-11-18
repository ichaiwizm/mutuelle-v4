/**
 * Simple lead selector for Playwright projects
 */
import type { Lead } from '@/shared/types/lead';
import { loadAllLeads } from './loadLeads';
import { hasConjoint, getChildrenCount } from './leadFilters';

export type LeadType = 'random' | 'conjoint' | 'children' | 'both';

/**
 * Select a lead based on type
 */
export function selectLead(type: LeadType = 'random'): Lead {
  const allLeads = loadAllLeads();

  if (type === 'random') {
    return randomLead(allLeads);
  }

  // Filter leads based on criteria
  const filtered = allLeads.filter((lead) => {
    const hasConj = hasConjoint(lead);
    const hasChild = getChildrenCount(lead) > 0;

    switch (type) {
      case 'conjoint':
        return hasConj;
      case 'children':
        return hasChild;
      case 'both':
        return hasConj && hasChild;
      default:
        return true;
    }
  });

  if (filtered.length === 0) {
    console.warn(`⚠️  No lead found matching type "${type}", falling back to random`);
    return randomLead(allLeads);
  }

  return randomLead(filtered);
}

/**
 * Get a random lead from array
 */
function randomLead(leads: Lead[]): Lead {
  const index = Math.floor(Math.random() * leads.length);
  return leads[index];
}

/**
 * Get lead type name for logging
 */
export function getLeadTypeName(type: LeadType): string {
  switch (type) {
    case 'random':
      return '🎲 Random';
    case 'conjoint':
      return '👫 Avec conjoint';
    case 'children':
      return '👶 Avec enfants';
    case 'both':
      return '👨‍👩‍👧 Conjoint + Enfants';
    default:
      return 'Unknown';
  }
}

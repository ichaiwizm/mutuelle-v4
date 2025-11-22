/**
 * Lead statistics helpers
 *
 * Provides universal statistics for categorized leads.
 */
import type { CategorizedLead } from './leadCategorization';

/**
 * Get lead statistics for display
 *
 * @param leads - Array of categorized leads
 * @returns Statistics object with counts for various lead characteristics
 */
export function getLeadStatistics(leads: CategorizedLead[]) {
  return {
    total: leads.length,
    withConjoint: leads.filter((l) => l.metadata.hasConjoint).length,
    withChildren: leads.filter((l) => l.metadata.childrenCount > 0).length,
    tns: leads.filter((l) => l.metadata.regimeType === 'TNS_INDEPENDANT').length,
    salaries: leads.filter((l) => l.metadata.regimeType === 'SALARIE').length,
  };
}

/**
 * Lead statistics helpers
 */
import type { CategorizedLead } from './leadCategorization';

/**
 * Get lead statistics for display
 */
export function getLeadStatistics(leads: CategorizedLead[]) {
  return {
    total: leads.length,
    withConjoint: leads.filter(l => l.metadata.hasConjoint).length,
    withChildren: leads.filter(l => l.metadata.childrenCount > 0).length,
    withCadreExercice: leads.filter(l => l.metadata.requiresCadreExercice).length,
    tns: leads.filter(l => l.metadata.regimeType === 'TNS_INDEPENDANT').length,
    salaries: leads.filter(l => l.metadata.regimeType === 'SALARIE').length,
  };
}

/**
 * Lead filtering - Re-exports from modular files
 */

// Export accessors
export {
  hasConjoint,
  getChildrenCount,
  getProfession,
  getRegimeSocial,
  getRegimeType,
  getSubscriberName,
  getCivilite,
} from './leadAccessors';

// Export categorization
export type { CategorizedLead, LeadFilterCriteria } from './leadCategorization';
export {
  leadRequiresCadreExercice,
  categorizeLead,
  categorizeLeads,
  filterLeads,
} from './leadCategorization';

// Export statistics
export { getLeadStatistics } from './leadStatistics';

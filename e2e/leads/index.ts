/**
 * E2E Lead Utilities
 *
 * Centralized exports for all lead-related utilities including:
 * - Lead loading from fixtures
 * - Lead selection and filtering
 * - Lead accessors and statistics
 * - Bulk test logging
 */

// Load leads
export { loadAllLeads } from './loadLeads';
export type { Lead } from './loadLeads';

// Lead selection
export {
  selectLead,
  selectLeadByIndex,
  getLeadTypeName,
  getLeadCount
} from './leadSelector';

// Lead accessors
export {
  hasConjoint,
  getChildrenCount,
  getProfession,
  getRegimeSocial,
  getRegimeType,
  getSubscriberName,
  getCivilite
} from './leadAccessors';

// Lead statistics
export { getLeadStatistics } from './leadStatistics';

// Bulk test logging
export {
  BulkTestLogger,
  BulkTestResultCollector,
  ResultFormatter
} from './bulkTestLogger';

// Re-export all filters (facade)
export * from './leadFilters';

/**
 * Lead filtering - Re-exports from modular files
 * Note: Platform-specific categorization (leadCategorization) is in alptis/helpers/
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

// Export statistics
export { getLeadStatistics } from './leadStatistics';

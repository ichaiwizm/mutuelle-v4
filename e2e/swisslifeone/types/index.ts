/**
 * SwissLife One E2E test types
 *
 * This file contains SwissLife-specific types and re-exports shared types.
 */

// Re-export shared types from centralized location
export type {
  Lead,
  LeadType,
  LeadTestResult,
  BulkTestConfig,
  BulkTestResults,
  TestStatistics,
} from '../../leads/types';

export { LEAD_TYPE_NAMES } from '../../leads/types';

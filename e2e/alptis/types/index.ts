/**
 * Alptis E2E test types
 *
 * This file re-exports shared types for convenience.
 * No Alptis-specific types are defined here.
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

// Re-export logging types from shared location
export { LogLevel } from '../../leads/logging';
export type { LoggerOptions } from '../../leads/logging';

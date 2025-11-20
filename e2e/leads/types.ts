/**
 * Re-export shared lead selection types for e2e tests
 *
 * This file provides a convenient import location for lead-related types
 * used in Playwright e2e tests across all platforms.
 */

export type {
  LeadType,
  LeadTestResult,
  BulkTestConfig,
  BulkTestResults,
  TestStatistics,
} from '@/shared/types/lead-selection';

export { LEAD_TYPE_NAMES } from '@/shared/types/lead-selection';

export type { Lead } from '@/shared/types/lead';

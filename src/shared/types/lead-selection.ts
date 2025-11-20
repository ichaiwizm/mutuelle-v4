/**
 * Shared types for lead selection and testing
 *
 * These types are used across all platforms (Alptis, SwissLife, etc.)
 * for lead selection, filtering, and test execution.
 */

/**
 * Lead selection type for filtering
 *
 * - `random`: No filtering, selects any lead
 * - `solo`: Only leads without conjoint AND without children
 * - `conjoint`: Only leads with conjoint WITHOUT children
 * - `children`: Only leads with children WITHOUT conjoint
 * - `both`: Only leads with BOTH conjoint AND children
 */
export type LeadType = 'random' | 'solo' | 'conjoint' | 'children' | 'both';

/**
 * Display names for lead types
 * Used for logging and test descriptions
 */
export const LEAD_TYPE_NAMES: Record<LeadType, string> = {
  random: '🎲 Random',
  solo: '🧍 Solo (sans conjoint ni enfants)',
  conjoint: '👫 Avec conjoint uniquement',
  children: '👶 Avec enfants uniquement',
  both: '👨‍👩‍👧 Conjoint + Enfants',
} as const;

/**
 * Result of a single lead test execution
 */
export interface LeadTestResult {
  /** Sequential number of the lead in the test run */
  leadNumber: number;
  /** Unique identifier of the lead */
  leadId: string;
  /** Full name of the subscriber */
  subscriber: string;
  /** Whether the lead has a conjoint */
  hasConjoint: boolean;
  /** Number of children */
  childrenCount: number;
  /** Whether the test passed */
  success: boolean;
  /** Error message if the test failed */
  error?: string;
  /** Test execution duration in milliseconds */
  duration: number;
}

/**
 * Configuration for bulk test execution
 */
export interface BulkTestConfig {
  /** Maximum time to wait for each test in milliseconds */
  timeout?: number;
  /** Whether to continue testing after a failure */
  continueOnFailure?: boolean;
  /** Maximum number of tests to run concurrently */
  maxConcurrent?: number;
}

/**
 * Results from bulk test execution
 */
export interface BulkTestResults {
  /** Total number of leads tested */
  total: number;
  /** Number of successful tests */
  passed: number;
  /** Number of failed tests */
  failed: number;
  /** Total execution duration in milliseconds */
  duration: number;
}

/**
 * Aggregated test statistics
 */
export interface TestStatistics {
  /** Total number of tests */
  total: number;
  /** Number of successful tests */
  successCount: number;
  /** Number of failed tests */
  failureCount: number;
  /** Success rate as a percentage (0-100) */
  successRate: number;
  /** Average test duration in milliseconds */
  avgDuration: number;
}

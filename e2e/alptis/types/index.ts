/**
 * Shared types for Alptis E2E tests
 *
 * This file centralizes all common types used across the test suite
 * to avoid duplication and maintain consistency.
 */

import type { Lead } from '@/shared/types/lead';

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

/**
 * Log level for test logging
 */
export enum LogLevel {
  /** Only critical errors */
  ERROR = 0,
  /** Warnings and errors */
  WARN = 1,
  /** General information, warnings, and errors */
  INFO = 2,
  /** Detailed information */
  VERBOSE = 3,
  /** Debug-level information */
  DEBUG = 4,
}

/**
 * Options for configuring a logger
 */
export interface LoggerOptions {
  /** Minimum log level to display */
  verbosity: LogLevel;
  /** Width of separator lines */
  lineWidth: number;
  /** Locale for messages */
  locale: 'en' | 'fr';
}

// Re-export Lead type for convenience
export type { Lead };

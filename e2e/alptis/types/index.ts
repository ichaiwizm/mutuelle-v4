/**
 * Alptis E2E test types
 *
 * This file contains Alptis-specific types and re-exports shared types.
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

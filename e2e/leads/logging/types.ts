/**
 * Logging types for test execution
 *
 * Universal types used across all platforms.
 */

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

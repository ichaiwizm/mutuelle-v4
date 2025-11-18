/**
 * Logging interfaces for test execution
 *
 * Provides abstractions for logging to allow different implementations
 * (console, file, structured logging, etc.)
 */

import { LogLevel } from '../../types';
import type { LoggerOptions } from '../../types';

/**
 * Interface for test logging
 * Allows for multiple implementations (console, file, structured, etc.)
 */
export interface ITestLogger {
  /**
   * Log a major section header
   * @param message - The header message
   */
  logHeader(message: string): void;

  /**
   * Log a test step
   * @param step - Step name
   * @param details - Optional details about the step
   */
  logStep(step: string, details?: string): void;

  /**
   * Log a successful step completion
   * @param message - Success message
   */
  logStepSuccess(message: string): void;

  /**
   * Log a success message
   * @param message - Success message
   */
  logSuccess(message: string): void;

  /**
   * Log an error message
   * @param message - Error message
   */
  logError(message: string): void;

  /**
   * Log a warning message
   * @param message - Warning message
   */
  logWarning(message: string): void;

  /**
   * Log an informational message
   * @param message - Info message
   */
  logInfo(message: string): void;

  /**
   * Log a separator line
   * @param heavy - If true, use heavy separator; otherwise use light
   */
  logSeparator(heavy?: boolean): void;
}

/**
 * Default logger options
 */
export const DEFAULT_LOGGER_OPTIONS: LoggerOptions = {
  verbosity: LogLevel.INFO,
  lineWidth: 80,
  locale: 'fr',
} as const;

// Re-export types for convenience
export type { LogLevel, LoggerOptions };

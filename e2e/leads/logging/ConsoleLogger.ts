/**
 * Console implementation of the test logger interface
 */

import { LogLevel } from './types';
import type { ITestLogger, LoggerOptions } from './interfaces';
import { DEFAULT_LOGGER_OPTIONS } from './interfaces';

/**
 * Console-based logger implementation
 * Outputs formatted messages to the console with support for verbosity levels
 */
export class ConsoleTestLogger implements ITestLogger {
  private readonly options: LoggerOptions;

  constructor(options: Partial<LoggerOptions> = {}) {
    this.options = { ...DEFAULT_LOGGER_OPTIONS, ...options };
  }

  logHeader(message: string): void {
    if (this.options.verbosity >= LogLevel.INFO) {
      console.log('\n' + this.repeat(this.options.lineWidth, '='));
      console.log(message);
      console.log(this.repeat(this.options.lineWidth, '='));
    }
  }

  logStep(step: string, details?: string): void {
    if (this.options.verbosity >= LogLevel.VERBOSE) {
      const message = details ? `${step}: ${details}` : `${step}...`;
      console.log(`📝 ${message}`);
    }
  }

  logStepSuccess(message: string): void {
    if (this.options.verbosity >= LogLevel.VERBOSE) {
      console.log(`   ✅ ${message}`);
    }
  }

  logSuccess(message: string): void {
    if (this.options.verbosity >= LogLevel.INFO) {
      console.log(`✅ ${message}`);
    }
  }

  logError(message: string): void {
    if (this.options.verbosity >= LogLevel.ERROR) {
      console.error(`❌ ${message}`);
    }
  }

  logWarning(message: string): void {
    if (this.options.verbosity >= LogLevel.WARN) {
      console.warn(`⚠️  ${message}`);
    }
  }

  logInfo(message: string): void {
    if (this.options.verbosity >= LogLevel.INFO) {
      console.log(`ℹ️  ${message}`);
    }
  }

  logSeparator(heavy = false): void {
    if (this.options.verbosity >= LogLevel.INFO) {
      const char = heavy ? '=' : '-';
      console.log(this.repeat(this.options.lineWidth, char));
    }
  }

  /**
   * Repeat a character n times
   * @param count - Number of repetitions
   * @param char - Character to repeat
   * @returns The repeated string
   */
  private repeat(count: number, char: string): string {
    return char.repeat(count);
  }
}

/**
 * Structured logger for Flow execution
 * Provides context-aware logging with JSON output for better traceability
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  flowKey: string;
  leadId?: string;
  message: string;
  data?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
};

/**
 * FlowLogger - Structured logger for flow execution
 * Provides contextual logging with JSON output
 */
export class FlowLogger {
  private flowKey: string;
  private leadId?: string;
  private verbose: boolean;

  constructor(flowKey: string, leadId?: string, verbose: boolean = false) {
    this.flowKey = flowKey;
    this.leadId = leadId;
    this.verbose = verbose;
  }

  /**
   * Log informational message
   * Only logs if verbose mode is enabled
   */
  info(message: string, data?: Record<string, any>): void {
    if (this.verbose) {
      this.log('INFO', message, data);
    }
  }

  /**
   * Log warning message
   * Always logs warnings regardless of verbose mode
   */
  warn(message: string, data?: Record<string, any>): void {
    this.log('WARN', message, data);
  }

  /**
   * Log error message
   * Always logs errors regardless of verbose mode
   */
  error(message: string, error?: Error, data?: Record<string, any>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      flowKey: this.flowKey,
      leadId: this.leadId,
      message,
      ...(data && { data }),
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      }),
    };

    console.error(JSON.stringify(logEntry));
  }

  /**
   * Log debug message
   * Only logs if verbose mode is enabled
   */
  debug(message: string, data?: Record<string, any>): void {
    if (this.verbose) {
      this.log('DEBUG', message, data);
    }
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, data?: Record<string, any>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      flowKey: this.flowKey,
      leadId: this.leadId,
      message,
      ...(data && { data }),
    };

    const logMethod = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
    logMethod(JSON.stringify(logEntry));
  }

  /**
   * Create a child logger with additional context (e.g., for a specific step)
   */
  child(additionalContext: { stepId?: string; [key: string]: any }): FlowLogger {
    const childLogger = new FlowLogger(this.flowKey, this.leadId, this.verbose);

    // Override log method to include additional context
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (level: LogLevel, message: string, data?: Record<string, any>) => {
      originalLog(level, message, { ...additionalContext, ...data });
    };

    return childLogger;
  }
}

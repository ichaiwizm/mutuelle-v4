import log from "electron-log";
import { app } from "electron";
import path from "node:path";

/**
 * Application-wide logger using electron-log
 *
 * Features:
 * - File rotation (5 files max, 5MB each)
 * - Console output in development
 * - Structured logging with context
 * - Different log levels (error, warn, info, debug)
 *
 * Log files location:
 * - macOS: ~/Library/Logs/{appName}/main.log
 * - Windows: %USERPROFILE%\AppData\Roaming\{appName}\logs\main.log
 * - Linux: ~/.config/{appName}/logs/main.log
 */

// Configure log file path
const isDev = process.env.ELECTRON_RENDERER_URL !== undefined;

// Configure file transport
log.transports.file.maxSize = 5 * 1024 * 1024; // 5MB
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";

// In development, also show logs in console
log.transports.console.level = isDev ? "debug" : "warn";
log.transports.file.level = isDev ? "debug" : "info";

// Custom file name
log.transports.file.fileName = "main.log";

/**
 * Logger interface with context support
 */
export interface LogContext {
  service?: string;
  flowKey?: string;
  leadId?: number;
  runId?: number;
  runItemId?: number;
  [key: string]: unknown;
}

/**
 * Format context object for logging
 */
function formatContext(context?: LogContext): string {
  if (!context) return "";
  const parts: string[] = [];
  if (context.service) parts.push(`[${context.service}]`);
  if (context.flowKey) parts.push(`flow=${context.flowKey}`);
  if (context.leadId) parts.push(`lead=${context.leadId}`);
  if (context.runId) parts.push(`run=${context.runId}`);
  if (context.runItemId) parts.push(`item=${context.runItemId}`);

  // Add any extra context fields
  const extraKeys = Object.keys(context).filter(
    (k) => !["service", "flowKey", "leadId", "runId", "runItemId"].includes(k)
  );
  for (const key of extraKeys) {
    const value = context[key];
    if (value !== undefined && value !== null) {
      parts.push(`${key}=${JSON.stringify(value)}`);
    }
  }

  return parts.join(" ");
}

/**
 * Main logger object
 */
export const logger = {
  /**
   * Log an error message
   */
  error(message: string, context?: LogContext, error?: unknown) {
    const ctx = formatContext(context);
    if (error instanceof Error) {
      log.error(`${ctx} ${message}`, error.message, error.stack);
    } else if (error) {
      log.error(`${ctx} ${message}`, error);
    } else {
      log.error(`${ctx} ${message}`);
    }
  },

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext) {
    const ctx = formatContext(context);
    log.warn(`${ctx} ${message}`);
  },

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext) {
    const ctx = formatContext(context);
    log.info(`${ctx} ${message}`);
  },

  /**
   * Log a debug message (only in development or when debug level is enabled)
   */
  debug(message: string, context?: LogContext) {
    const ctx = formatContext(context);
    log.debug(`${ctx} ${message}`);
  },

  /**
   * Create a child logger with preset context
   */
  child(defaultContext: LogContext) {
    return {
      error: (message: string, context?: LogContext, error?: unknown) =>
        logger.error(message, { ...defaultContext, ...context }, error),
      warn: (message: string, context?: LogContext) =>
        logger.warn(message, { ...defaultContext, ...context }),
      info: (message: string, context?: LogContext) =>
        logger.info(message, { ...defaultContext, ...context }),
      debug: (message: string, context?: LogContext) =>
        logger.debug(message, { ...defaultContext, ...context }),
    };
  },

  /**
   * Get the path to the log file
   */
  getLogPath(): string {
    return log.transports.file.getFile()?.path || "";
  },

  /**
   * Get the raw electron-log instance for advanced usage
   */
  getRawLogger() {
    return log;
  },
};

/**
 * Initialize the logger (call once at app startup)
 */
export function initLogger() {
  const logPath = logger.getLogPath();
  logger.info("Logger initialized", {
    service: "LOGGER",
    path: logPath,
    isDev,
  });
  logger.info(`App version: ${app.getVersion()}`, { service: "LOGGER" });
  logger.info(`Platform: ${process.platform} ${process.arch}`, {
    service: "LOGGER",
  });
}

export default logger;

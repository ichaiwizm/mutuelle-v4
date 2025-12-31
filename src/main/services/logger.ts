import log from "electron-log";
import { app } from "electron";
import type { LogContext } from "./logger/types";
import { formatContext } from "./logger/formatter";

export type { LogContext };

const isDev = process.env.ELECTRON_RENDERER_URL !== undefined;

log.transports.file.maxSize = 5 * 1024 * 1024;
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";
log.transports.console.level = isDev ? "debug" : "warn";
log.transports.file.level = isDev ? "debug" : "info";
log.transports.file.fileName = "main.log";

export const logger = {
  error(message: string, context?: LogContext, error?: unknown) {
    const ctx = formatContext(context);
    if (error instanceof Error) log.error(`${ctx} ${message}`, error.message, error.stack);
    else if (error) log.error(`${ctx} ${message}`, error);
    else log.error(`${ctx} ${message}`);
  },

  warn(message: string, context?: LogContext) {
    log.warn(`${formatContext(context)} ${message}`);
  },

  info(message: string, context?: LogContext) {
    log.info(`${formatContext(context)} ${message}`);
  },

  debug(message: string, context?: LogContext) {
    log.debug(`${formatContext(context)} ${message}`);
  },

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

  getLogPath(): string {
    return log.transports.file.getFile()?.path || "";
  },

  getRawLogger() {
    return log;
  },
};

export function initLogger() {
  const logPath = logger.getLogPath();
  logger.info("Logger initialized", { service: "LOGGER", path: logPath, isDev });
  logger.info(`App version: ${app.getVersion()}`, { service: "LOGGER" });
  logger.info(`Platform: ${process.platform} ${process.arch}`, { service: "LOGGER" });
}

export default logger;

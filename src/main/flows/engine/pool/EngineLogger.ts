import { logger } from "@/main/services/logger";
import { shortId, type PoolComponent, type PoolLogContext } from "./LoggerTypes";

function createComponentLogger(component: PoolComponent) {
  const service = `FlowPool:${component}`;
  return {
    debug(message: string, context?: PoolLogContext) {
      logger.debug(message, { service, ...context });
    },
    info(message: string, context?: PoolLogContext) {
      logger.info(message, { service, ...context });
    },
    warn(message: string, context?: PoolLogContext) {
      logger.warn(message, { service, ...context });
    },
    error(message: string, context?: PoolLogContext, error?: unknown) {
      logger.error(message, { service, ...context }, error);
    },
  };
}

export const engineLogger = {
  for(component: PoolComponent) {
    return createComponentLogger(component);
  },
  debug(component: PoolComponent, message: string, context?: PoolLogContext) {
    createComponentLogger(component).debug(message, context);
  },
  info(component: PoolComponent, message: string, context?: PoolLogContext) {
    createComponentLogger(component).info(message, context);
  },
  warn(component: PoolComponent, message: string, context?: PoolLogContext) {
    createComponentLogger(component).warn(message, context);
  },
  error(component: PoolComponent, message: string, context?: PoolLogContext, error?: unknown) {
    createComponentLogger(component).error(message, context, error);
  },
  shortId,
};

export default engineLogger;
export { type PoolComponent, type PoolLogContext } from "./LoggerTypes";

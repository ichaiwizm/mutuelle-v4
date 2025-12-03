import type { FlowHooks } from "./hooks";

/**
 * Configuration for flow execution
 */
export type FlowExecutionConfig = {
  skipAuth?: boolean;
  skipNavigation?: boolean;
  stopOnError?: boolean;
  screenshotOnError?: boolean;
  screenshotOnSuccess?: boolean;
  verbose?: boolean;
  hooks?: FlowHooks;
  enablePauseResume?: boolean;
  stateId?: string;
  /** Step ID to stop at for manual takeover. If set, execution will halt after this step completes. */
  stopAtStep?: string;
};

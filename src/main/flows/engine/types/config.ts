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
  /** If false, stop before the submit step for manual takeover. Default: true (auto-submit). */
  autoSubmit?: boolean;
};

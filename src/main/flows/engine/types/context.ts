import type { Page } from "playwright";
import type { Lead } from "../../../../shared/types/lead";
import type { StepDefinition } from "../../../../shared/types/product";
import type { FlowLogger } from "../FlowLogger";
import type { PlatformCredentials } from "./credentials";
import type { PlatformServices } from "../services/types";

/**
 * Execution context passed to all steps
 */
export type ExecutionContext<T = any> = {
  page: Page;
  lead?: Lead;
  transformedData?: T;
  credentials?: PlatformCredentials;
  artifactsDir?: string;
  flowKey: string;
  stepDefinition: StepDefinition;
  logger?: FlowLogger;
  /** Platform services (auth, navigation, formFill) injected by FlowEngine */
  services?: PlatformServices;
};

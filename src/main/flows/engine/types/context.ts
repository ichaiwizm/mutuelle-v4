import type { Page } from "playwright";
import type { Lead } from "../../../db/schema";
import type { StepDefinition } from "../../../../shared/types/product";
import type { FlowLogger } from "../FlowLogger";
import type { PlatformCredentials } from "./credentials";

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
};

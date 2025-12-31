/**
 * Flow definition, configuration, and result types
 */
import type { ExecutionLog, ExecutionStatus, StepExecutionResult } from './context.js';
import type { StepDefinition } from './step.js';
import type { MapperConfig } from './transformer.js';

/** Flow metadata */
export interface FlowMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/** Browser configuration for flow execution */
export interface BrowserConfig {
  headless?: boolean;
  viewportWidth?: number;
  viewportHeight?: number;
  userAgent?: string;
  timeout?: number;
  slowMo?: number;
}

/** Flow configuration options */
export interface FlowConfig {
  baseUrl?: string;
  browser?: BrowserConfig;
  defaultTimeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  stopOnError?: boolean;
  screenshotOnError?: boolean;
  screenshotsDir?: string;
  debug?: boolean;
}

/** Complete flow definition as parsed from YAML */
export interface FlowDefinition {
  metadata: FlowMetadata;
  config?: FlowConfig;
  inputMapper?: MapperConfig;
  outputMapper?: MapperConfig;
  steps: StepDefinition[];
}

/** Error information in flow result */
export interface FlowError {
  message: string;
  stepId?: string;
  code?: string;
  stack?: string;
  recoverable: boolean;
}

/** Flow execution result */
export interface FlowResult {
  executionId: string;
  flowId: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime: Date;
  durationMs: number;
  stepResults: StepExecutionResult[];
  output: Record<string, unknown>;
  error?: FlowError;
  logs: ExecutionLog[];
  screenshots: string[];
}

/** Flow validation result */
export interface FlowValidationResult {
  valid: boolean;
  errors: Array<{ path: string; message: string }>;
  warnings: Array<{ path: string; message: string }>;
}

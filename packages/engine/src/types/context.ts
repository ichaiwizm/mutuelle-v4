/**
 * Execution and Interpreter context types
 */
import type { StepDefinition } from './step.js';

/** Execution status */
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/** Log level for execution logs */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Execution log entry */
export interface ExecutionLog {
  timestamp: Date;
  level: LogLevel;
  message: string;
  stepId?: string;
  data?: Record<string, unknown>;
}

/** Step execution result */
export interface StepExecutionResult {
  stepId: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
  error?: Error;
  retryCount: number;
  extracted?: Record<string, unknown>;
}

/** Variables store for execution */
export interface VariableStore {
  input: Record<string, unknown>;
  extracted: Record<string, unknown>;
  computed: Record<string, unknown>;
  env: Record<string, string>;
}

/** Execution context passed through the flow */
export interface ExecutionContext {
  executionId: string;
  flowId: string;
  status: ExecutionStatus;
  variables: VariableStore;
  startTime: Date;
  currentStepIndex: number;
  stepResults: StepExecutionResult[];
  logs: ExecutionLog[];
  metadata: Record<string, unknown>;
}

/** Browser/page context for interpreter */
export interface BrowserContext {
  browserId: string;
  pageId: string;
  currentUrl: string;
  cookies: Array<{ name: string; value: string; domain: string }>;
  headless: boolean;
}

/** Interpreter context for action execution */
export interface InterpreterContext {
  execution: ExecutionContext;
  browser: BrowserContext;
  currentStep: StepDefinition | null;
  timeout: number;
  debug: boolean;
  screenshotsDir?: string;
  hooks: {
    onStepStart?: (step: StepDefinition) => Promise<void>;
    onStepEnd?: (step: StepDefinition, result: StepExecutionResult) => Promise<void>;
    onError?: (error: Error, step?: StepDefinition) => Promise<void>;
    onLog?: (log: ExecutionLog) => void;
  };
}

/** Create initial variable store */
export function createVariableStore(input: Record<string, unknown> = {}): VariableStore {
  return { input, extracted: {}, computed: {}, env: {} };
}

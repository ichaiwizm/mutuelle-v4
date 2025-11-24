import type { StepDefinition } from "../../../../shared/types/product";
import type { ExecutionContext } from "./context";
import type { StepResult, FlowExecutionResult } from "./result";

/**
 * Hook functions to extend FlowEngine behavior
 */
export type FlowHooks = {
  beforeFlow?: (context: ExecutionContext) => Promise<void>;
  afterFlow?: (context: ExecutionContext, result: FlowExecutionResult) => Promise<void>;
  beforeStep?: (context: ExecutionContext, stepDef: StepDefinition) => Promise<void>;
  afterStep?: (context: ExecutionContext, stepDef: StepDefinition, result: StepResult) => Promise<void>;
  onError?: (context: ExecutionContext, error: Error, stepDef?: StepDefinition) => Promise<void>;
  onRetry?: (context: ExecutionContext, stepDef: StepDefinition, attempt: number) => Promise<void>;
  onSkip?: (context: ExecutionContext, stepDef: StepDefinition, reason: string) => Promise<void>;
};

/**
 * Event types emitted by FlowEngine
 */
export type FlowEventType =
  | "flow:start" | "flow:complete" | "flow:error" | "flow:paused" | "flow:resumed"
  | "step:start" | "step:complete" | "step:error" | "step:retry" | "step:skip";

/**
 * Data payload for flow events
 */
export type FlowEventData = {
  flowKey: string;
  leadId?: string;
  stepId?: string;
  stepName?: string;
  result?: StepResult;
  error?: Error;
  attempt?: number;
  reason?: string;
  stateId?: string;
};

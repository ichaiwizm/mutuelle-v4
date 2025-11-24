import type { FlowExecutionResult, StepResult } from "../types";

type BuildResultOptions = {
  flowKey: string;
  leadId?: string;
  steps: StepResult[];
  startTime: number;
  stateId?: string;
  paused?: boolean;
  error?: Error;
};

/**
 * Builds a FlowExecutionResult from execution data
 */
export function buildFlowResult(options: BuildResultOptions): FlowExecutionResult {
  const { flowKey, leadId, steps, startTime, stateId, paused, error } = options;

  return {
    success: error ? false : (paused ? false : steps.every(s => s.success)),
    flowKey,
    leadId,
    steps,
    totalDuration: Date.now() - startTime,
    stateId,
    paused,
    error,
  };
}

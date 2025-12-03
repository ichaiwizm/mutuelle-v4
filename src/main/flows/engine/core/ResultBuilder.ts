import type { FlowExecutionResult, StepResult } from "../types";

type BuildResultOptions = {
  flowKey: string;
  leadId?: string;
  steps: StepResult[];
  startTime: number;
  stateId?: string;
  paused?: boolean;
  error?: Error;
  /** True if execution stopped for manual user takeover */
  waitingUser?: boolean;
  /** The step ID where execution stopped for manual takeover */
  stoppedAtStep?: string;
};

/**
 * Builds a FlowExecutionResult from execution data
 */
export function buildFlowResult(options: BuildResultOptions): FlowExecutionResult {
  const { flowKey, leadId, steps, startTime, stateId, paused, error, waitingUser, stoppedAtStep } = options;

  // waitingUser is considered a "success" state since steps completed successfully
  // but we mark success=false since the flow isn't actually complete yet
  const success = error ? false : (paused || waitingUser ? false : steps.every(s => s.success));

  return {
    success,
    flowKey,
    leadId,
    steps,
    totalDuration: Date.now() - startTime,
    stateId,
    paused,
    error,
    waitingUser,
    stoppedAtStep,
  };
}

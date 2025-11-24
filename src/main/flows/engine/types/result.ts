/**
 * Result of a step execution
 */
export type StepResult = {
  success: boolean;
  stepId: string;
  error?: Error;
  duration: number;
  retries: number;
  metadata?: Record<string, any>;
};

/**
 * Result of a complete flow execution
 */
export type FlowExecutionResult = {
  success: boolean;
  flowKey: string;
  leadId?: string;
  steps: StepResult[];
  totalDuration: number;
  error?: Error;
  paused?: boolean;
  stateId?: string;
};

/**
 * Status of a flow state
 */
export type FlowStateStatus = "running" | "paused" | "completed" | "failed";

/**
 * Persisted state of a flow execution for pause/resume
 */
export type FlowState = {
  id: string;
  flowKey: string;
  leadId?: string;
  currentStepIndex: number;
  completedSteps: string[];
  stepStates: Record<string, any>;
  status: FlowStateStatus;
  startedAt: number;
  pausedAt?: number;
  resumedAt?: number;
  completedAt?: number;
};

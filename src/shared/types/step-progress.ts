/**
 * Step progress tracking types for live automation visualization
 */

export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped" | "cancelled";

export type StepProgress = {
  id: string;
  name: string;
  status: StepStatus;
  startedAt?: number;
  completedAt?: number;
  duration?: number;
  screenshot?: string; // relative path within artifactsDir
  error?: string;
  retries?: number;
};

export type StepProgressData = {
  steps: StepProgress[];
  totalSteps: number;
  currentStepIndex: number;
  startedAt?: number;
  completedAt?: number;
};

export type RunItemProgress = {
  itemId: string;
  runId: string;
  flowKey: string;
  leadId: string;
  status: string;
  artifactsDir: string;
  stepsData: StepProgressData | null;
  startedAt?: number;
  completedAt?: number;
  errorMessage?: string;
};

// Events sent from main to renderer
export type AutomationProgressEvent =
  | { type: "run:started"; runId: string; itemCount: number }
  | { type: "run:completed"; runId: string; success: boolean }
  | { type: "run:cancelled"; runId: string }
  | { type: "item:started"; runId: string; itemId: string; flowKey: string; leadId: string; steps: StepProgress[] }
  | { type: "item:step:started"; runId: string; itemId: string; stepId: string; stepIndex: number }
  | { type: "item:step:completed"; runId: string; itemId: string; stepId: string; stepIndex: number; duration: number; screenshot?: string }
  | { type: "item:step:failed"; runId: string; itemId: string; stepId: string; stepIndex: number; error: string; screenshot?: string }
  | { type: "item:step:skipped"; runId: string; itemId: string; stepId: string; stepIndex: number; reason: string }
  | { type: "item:completed"; runId: string; itemId: string; success: boolean; duration: number }
  | { type: "item:failed"; runId: string; itemId: string; error: string }
  | { type: "item:cancelled"; runId: string; itemId: string };

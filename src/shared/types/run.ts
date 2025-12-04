import type { StepProgressData } from "./step-progress";

/**
 * Valid statuses for a run item
 * - queued: Waiting to be processed
 * - running: Currently being executed
 * - completed: Successfully finished
 * - failed: Execution failed with error
 * - cancelled: Cancelled by user
 * - waiting_user: Paused at configured step, waiting for manual takeover
 */
export type RunItemStatus = "queued" | "running" | "completed" | "failed" | "cancelled" | "waiting_user";

export type Run = {
  id: string;
  status: "queued" | "running" | "done" | "failed" | "cancelled";
  createdAt: Date | string;
  itemsCount?: number;
  failedCount?: number;
};

export type RunItem = {
  id: string;
  runId: string;
  flowKey: string;
  leadId: string;
  leadName?: string;
  status: RunItemStatus;
  artifactsDir: string;
  stepsData?: StepProgressData | null;
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
  errorMessage?: string | null;
};

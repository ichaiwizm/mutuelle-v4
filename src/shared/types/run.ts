import type { StepProgressData } from "./step-progress";

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
  status: string;
  artifactsDir: string;
  stepsData?: StepProgressData | null;
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
  errorMessage?: string | null;
};

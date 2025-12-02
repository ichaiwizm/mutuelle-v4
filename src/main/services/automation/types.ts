// Re-export shared types
export type { Run, RunItem } from "@/shared/types/run";

export type RunStatus = "queued" | "running" | "done" | "failed" | "cancelled";

export type RunWithItems = {
  id: string;
  status: RunStatus;
  createdAt: Date;
  items: import("@/shared/types/run").RunItem[];
};

export type EnqueueItem = {
  flowKey: string;
  leadId: string;
};

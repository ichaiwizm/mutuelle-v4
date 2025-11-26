export type Run = {
  id: string;
  status: "queued" | "running" | "done" | "failed" | "cancelled";
  createdAt: Date | string;
};

export type RunItem = {
  id: string;
  runId: string;
  flowKey: string;
  leadId: string;
  status: string;
  artifactsDir: string;
};

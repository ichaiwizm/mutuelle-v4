export type Lead = {
  id: string;
  subscriber: Record<string, unknown>;
  project?: Record<string, unknown>;
  children?: Array<Record<string, unknown>>;
};

export type LeadRow = {
  id: string;
  data: string;
  createdAt: Date;
  updatedAt: Date;
};

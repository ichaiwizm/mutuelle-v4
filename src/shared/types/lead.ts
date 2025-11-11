export type Lead = {
  id: string;
  // payload "simple" (normalisé) – détails via Zod
  subscriber: Record<string, unknown>;
  project?: Record<string, unknown>;
  children?: Array<Record<string, unknown>>;
};

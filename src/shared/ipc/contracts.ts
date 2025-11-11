export type Ipc = {
  leads: {
    list: () => Promise<{ id: string }[]>;
    create: (lead: unknown) => Promise<{ id: string }>;
    remove: (id: string) => Promise<void>;
  };
  credentials: {
    upsert: (p: { platform: string; login: string; password: string }) => Promise<void>;
    test: (platform: string) => Promise<{ ok: boolean; message?: string }>;
  };
  automation: {
    enqueue: (items: Array<{ flowKey: string; leadId: string }>) => Promise<{ runId: string }>;
  };
};

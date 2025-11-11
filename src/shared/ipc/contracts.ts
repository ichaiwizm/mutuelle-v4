export type Ipc = {
  mail: {
    status: () => Promise<{ ok: boolean; email?: string }>;
    connect: () => Promise<{ ok: boolean; email?: string; error?: string }>;
    fetch: (days: number) => Promise<{ fetched: number; scanned: number; matched: number; created: number }>;
  };
  flows: { list: () => Promise<import("@/shared/types/flow").Flow[]> };
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

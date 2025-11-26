import type { Flow } from "@/shared/types/flow";
import type { Lead } from "@/shared/types/lead";
import type { Run, RunItem } from "@/shared/types/run";
import type {
  ProductConfiguration,
  ProductStatus,
  ProductStatusValue,
} from "@/shared/types/product";

// ========== Mail ==========

export type MailStatus = { ok: boolean; email?: string };

export type MailFetchParams = {
  days: number;
  verbose?: boolean;
  concurrency?: number;
};

export type MatchedEmailSummary = {
  from: string;
  subject: string;
  provider?: string;
  isLead?: boolean;
};

export type MailFetchResult = {
  fetched: number;
  matched: number;
  detected: number;
  parsed: number;
  saved: number;
  errors?: string[];
  matchedEmails?: MatchedEmailSummary[];
};

// ========== Leads ==========

export type LeadsListResult = {
  leads: {
    id: string;
    data: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  total: number;
};

export type LeadsParseFromTextParams = {
  text: string;
  subject?: string;
};

export type LeadsParseAndCreateFromTextResult = {
  created: number;
  ids: string[];
};

// ========== Credentials ==========

export type CredentialsTestFrontendResult = {
  ok: boolean;
  error?: "NO_CREDENTIALS" | "UNKNOWN_PLATFORM" | "LOGIN_FAILED" | "TIMEOUT" | "BROWSER_ERROR";
  message?: string;
};

// ========== Automation ==========

export type AutomationEnqueueItem = { flowKey: string; leadId: string };

export type AutomationEnqueueResult = {
  runId: string;
  // Detailed pool result is kept as unknown on the frontend side for now
  result: unknown | null;
};

export type AutomationGetResult = (Run & { items: RunItem[] }) | null;

export type AutomationListResult = {
  runs: Run[];
  total: number;
};

// ========== Flow States (pause/resume) ==========

export type FlowStateStatus = "running" | "paused" | "completed" | "failed";

export type FlowStateDTO = {
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

export type FlowResumeResult = {
  success: boolean;
  flowKey: string;
  leadId?: string;
  totalDuration: number;
  paused?: boolean;
  stateId?: string;
  errorMessage?: string;
};

// ========== Products ==========

export type ProductStatusInput = {
  platform: string;
  product: string;
  status: ProductStatusValue;
  updatedBy?: string;
};

// ========== Dashboard ==========

export type DashboardOverview = {
  mail: MailStatus;
  leads: { total: number };
  automation: {
    totalRuns: number;
    recentRuns: Run[];
  };
  flows: {
    total: number;
    items: Flow[];
  };
  flowStates: {
    pausedCount: number;
  };
  products: {
    activeCount: number;
    active: ProductConfiguration[];
  };
};

// ========== IPC root contract ==========

export type Ipc = {
  mail: {
    status: () => Promise<MailStatus>;
    connect: () => Promise<{ email: string }>;
    fetch: (params: MailFetchParams) => Promise<MailFetchResult>;
    disconnect: () => Promise<{ ok: boolean }>;
    cancel: () => Promise<{ cancelled: boolean }>;
  };

  flows: {
    list: () => Promise<Flow[]>;
  };

  leads: {
    list: (options?: { limit?: number; offset?: number }) => Promise<LeadsListResult>;
    get: (id: string) => Promise<Lead | null>;
    create: (lead: unknown) => Promise<{ id: string }>;
    update: (
      id: string,
      data: {
        subscriber?: Record<string, unknown>;
        project?: Record<string, unknown>;
        children?: Array<Record<string, unknown>>;
      }
    ) => Promise<{ updated: boolean }>;
    remove: (id: string) => Promise<void>;
    parseFromText: (params: LeadsParseFromTextParams) => Promise<Lead[]>;
    parseAndCreateFromText: (
      params: LeadsParseFromTextParams
    ) => Promise<LeadsParseAndCreateFromTextResult>;
  };

  credentials: {
    upsert: (p: { platform: "alptis" | "swisslife"; login: string; password: string }) => Promise<void>;
    get: (platform: "alptis" | "swisslife") => Promise<{ platform: string; login: string; hasPassword: boolean } | null>;
    list: () => Promise<string[]>;
    delete: (platform: "alptis" | "swisslife") => Promise<{ deleted: boolean }>;
    test: (platform: "alptis" | "swisslife") => Promise<CredentialsTestFrontendResult>;
  };

  automation: {
    enqueue: (items: AutomationEnqueueItem[]) => Promise<AutomationEnqueueResult>;
    get: (runId: string) => Promise<AutomationGetResult>;
    list: (options?: { limit?: number; offset?: number }) => Promise<AutomationListResult>;
    cancel: (runId: string) => Promise<{ cancelled: boolean }>;
  };

  products: {
    listConfigs: () => Promise<ProductConfiguration[]>;
    getConfig: (flowKey: string) => Promise<ProductConfiguration | null>;
    listActiveConfigs: () => Promise<ProductConfiguration[]>;
    listStatuses: () => Promise<ProductStatus[]>;
    getStatus: (platform: string, product: string) => Promise<ProductStatus | null>;
    saveStatus: (input: ProductStatusInput) => Promise<ProductStatus>;
    updateStatus: (input: ProductStatusInput) => Promise<ProductStatus>;
  };

  flowStates: {
    listPaused: () => Promise<FlowStateDTO[]>;
    get: (id: string) => Promise<FlowStateDTO | null>;
    delete: (id: string) => Promise<{ deleted: boolean }>;
    resume: (id: string) => Promise<FlowResumeResult>;
  };

  dashboard: {
    overview: () => Promise<DashboardOverview>;
  };
};

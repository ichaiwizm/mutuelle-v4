import type { Flow } from "@/shared/types/flow";
import type { Lead } from "@/shared/types/lead";
import type { LeadFormSchemaResult } from "@/shared/types/form-schema";
import type { Run, RunItem } from "@/shared/types/run";
import type {
  ProductConfiguration,
  ProductStatus,
  ProductStatusValue,
} from "@/shared/types/product";
import type { AutomationProgressEvent } from "@/shared/types/step-progress";
import type { AutomationSettings, AutomationSettingsInput } from "@/shared/types/automation";
import type {
  Devis,
  DevisFilters,
  CreateDevisInput,
  UpdateDevisInput,
} from "@/shared/types/devis";

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
  duplicates: number;
  cancelled?: boolean;
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

// ========== Data Export ==========

export type DataExportResult = {
  exported: boolean;
  path?: string;
  count?: number;
  reason?: "NO_LEADS" | "CANCELLED";
};

export type DataLogsPathResult = {
  path: string;
};

// ========== Feedback ==========

export type FeedbackSendParams = {
  message: string;
  email?: string;
  name?: string;
};

export type FeedbackSendResult = {
  sent: boolean;
};

// ========== App ==========

export type AppVersionResult = { version: string };

// ========== Auto-Update ==========

export type UpdateStatus =
  | { state: "checking" }
  | { state: "available"; version: string }
  | { state: "downloading"; percent: number; bytesPerSecond: number; transferred: number; total: number }
  | { state: "ready"; version: string }
  | { state: "not-available" }
  | { state: "error"; message: string };

// ========== Devis ==========

export type DevisRow = {
  id: string;
  leadId: string;
  flowKey: string;
  status: string;
  data: string | null;
  pdfPath: string | null;
  errorMessage: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
};

export type DevisWithLead = Devis & {
  leadName?: string;
  productName?: string;
};

export type DevisListResult = {
  devis: DevisRow[];
  total: number;
};

export type DevisListByLeadResult = {
  devis: DevisWithLead[];
};

export type DevisExportPdfResult = {
  success: boolean;
  exportedPath?: string;
};

export type DevisCountByLeadResult = Record<string, number>;

export type DevisStatsResult = {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  expired: number;
  recent: DevisWithLead[];
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
  credentials: {
    configuredCount: number;
  };
  devis: {
    total: number;
    pending: number;
    completed: number;
    failed: number;
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
    isConnecting: () => Promise<{ isConnecting: boolean }>;
    cancelConnect: () => Promise<{ cancelled: boolean }>;
  };

  flows: {
    list: () => Promise<Flow[]>;
  };

  leads: {
    list: (options?: { limit?: number; offset?: number; search?: string }) => Promise<LeadsListResult>;
    get: (id: string) => Promise<Lead | null>;
    create: (lead: unknown) => Promise<{ id: string; duplicate?: boolean }>;
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
    getFormSchema: () => Promise<LeadFormSchemaResult>;
  };

  credentials: {
    upsert: (p: { platform: "alptis" | "swisslife" | "entoria"; login: string; password: string; courtierCode?: string }) => Promise<void>;
    get: (platform: "alptis" | "swisslife" | "entoria") => Promise<{ platform: string; login: string; hasPassword: boolean; hasCourtierCode?: boolean } | null>;
    list: () => Promise<string[]>;
    delete: (platform: "alptis" | "swisslife" | "entoria") => Promise<{ deleted: boolean }>;
    test: (platform: "alptis" | "swisslife" | "entoria") => Promise<CredentialsTestFrontendResult>;
  };

  automation: {
    enqueue: (items: AutomationEnqueueItem[]) => Promise<AutomationEnqueueResult>;
    get: (runId: string) => Promise<AutomationGetResult>;
    getItem: (itemId: string) => Promise<RunItem | null>;
    list: (options?: { limit?: number; offset?: number }) => Promise<AutomationListResult>;
    cancel: (runId: string) => Promise<{ cancelled: boolean }>;
    delete: (runId: string) => Promise<{ deleted: boolean }>;
    retry: (runId: string) => Promise<{ newRunId: string }>;
    retryItem: (itemId: string) => Promise<{ newRunId: string }>;
    readScreenshot: (path: string) => Promise<string>; // base64 encoded image
    onProgress: (callback: (event: AutomationProgressEvent) => void) => () => void;
    bringToFront: (itemId: string) => Promise<{ success: boolean }>; // Bring browser window to front for manual takeover
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

  shell: {
    openPath: (path: string) => Promise<{ success: boolean }>;
  };

  automationSettings: {
    get: (flowKey: string) => Promise<AutomationSettings | null>;
    list: () => Promise<AutomationSettings[]>;
    save: (flowKey: string, settings: AutomationSettingsInput) => Promise<AutomationSettings>;
  };

  data: {
    exportLeads: () => Promise<DataExportResult>;
    exportDb: () => Promise<DataExportResult>;
    getLogsPath: () => Promise<DataLogsPathResult>;
  };

  feedback: {
    send: (params: FeedbackSendParams) => Promise<FeedbackSendResult>;
  };

  update: {
    onStatus: (callback: (status: UpdateStatus) => void) => () => void;
    check: () => Promise<void>;
    download: () => Promise<void>;
    install: () => Promise<void>;
  };

  app: {
    getVersion: () => Promise<AppVersionResult>;
  };

  devis: {
    list: (options?: {
      limit?: number;
      offset?: number;
      filters?: DevisFilters;
    }) => Promise<DevisListResult>;
    listByLead: (leadId: string) => Promise<DevisListByLeadResult>;
    get: (id: string) => Promise<Devis | null>;
    create: (input: CreateDevisInput) => Promise<{ id: string }>;
    update: (id: string, data: UpdateDevisInput) => Promise<{ updated: boolean }>;
    delete: (id: string) => Promise<{ deleted: boolean }>;
    exportPdf: (id: string) => Promise<DevisExportPdfResult>;
    duplicate: (id: string) => Promise<{ id: string }>;
    countByLead: (leadIds: string[]) => Promise<DevisCountByLeadResult>;
    stats: () => Promise<DevisStatsResult>;
  };
};

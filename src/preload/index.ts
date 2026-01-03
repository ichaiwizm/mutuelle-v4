import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { IPC_CHANNEL } from "@/main/ipc/channels";
import type { Ipc, UpdateStatus } from "@/shared/ipc/contracts";
import type { AutomationProgressEvent } from "@/shared/types/step-progress";

type IpcResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; message: string; details?: Record<string, unknown> };

async function invokeIpc<T>(
  channel: (typeof IPC_CHANNEL)[keyof typeof IPC_CHANNEL],
  payload?: unknown
): Promise<T> {
  const result = await ipcRenderer.invoke(channel, payload);

  if (result && typeof result === "object" && "ok" in result) {
    const ipcResult = result as IpcResult<T>;
    if (ipcResult.ok) {
      return ipcResult.data;
    }

    const error = new Error(ipcResult.message || "IPC error");
    (error as any).code = ipcResult.error;
    (error as any).details = ipcResult.details;
    throw error;
  }

  return result as T;
}

const api: Ipc = {
  mail: {
    status: () => invokeIpc(IPC_CHANNEL.MAIL_STATUS),
    connect: () => invokeIpc(IPC_CHANNEL.MAIL_CONNECT),
    fetch: (params) => invokeIpc(IPC_CHANNEL.MAIL_FETCH, params),
    disconnect: () => invokeIpc(IPC_CHANNEL.MAIL_DISCONNECT),
    cancel: () => invokeIpc(IPC_CHANNEL.MAIL_CANCEL),
    isConnecting: () => invokeIpc(IPC_CHANNEL.MAIL_IS_CONNECTING),
    cancelConnect: () => invokeIpc(IPC_CHANNEL.MAIL_CANCEL_CONNECT),
  },

  flows: {
    list: () => invokeIpc(IPC_CHANNEL.FLOWS_LIST),
  },

  leads: {
    list: (options) => invokeIpc(IPC_CHANNEL.LEADS_LIST, options),
    get: (id) => invokeIpc(IPC_CHANNEL.LEADS_GET, { id }),
    create: (lead) => invokeIpc(IPC_CHANNEL.LEADS_CREATE, lead),
    update: (id, data) => invokeIpc(IPC_CHANNEL.LEADS_UPDATE, { id, data }),
    remove: async (id) => {
      await invokeIpc(IPC_CHANNEL.LEADS_REMOVE, { id });
    },
    parseFromText: (params) => invokeIpc(IPC_CHANNEL.LEADS_PARSE_FROM_TEXT, params),
    parseAndCreateFromText: (params) =>
      invokeIpc(IPC_CHANNEL.LEADS_PARSE_AND_CREATE_FROM_TEXT, params),
    getFormSchema: () => invokeIpc(IPC_CHANNEL.LEADS_GET_FORM_SCHEMA),
  },

  credentials: {
    upsert: async (p) => {
      await invokeIpc(IPC_CHANNEL.CREDS_UPSERT, p);
    },
    get: (platform) => invokeIpc(IPC_CHANNEL.CREDS_GET, { platform }),
    list: () => invokeIpc(IPC_CHANNEL.CREDS_LIST),
    delete: (platform) => invokeIpc(IPC_CHANNEL.CREDS_DELETE, { platform }),
    test: (platform) => invokeIpc(IPC_CHANNEL.CREDS_TEST, { platform }),
  },

  automation: {
    enqueue: (items) => invokeIpc(IPC_CHANNEL.AUTO_ENQUEUE, { items }),
    get: (runId) => invokeIpc(IPC_CHANNEL.AUTO_GET, { runId }),
    getItem: (itemId) => invokeIpc(IPC_CHANNEL.AUTO_GET_ITEM, { itemId }),
    list: (options) => invokeIpc(IPC_CHANNEL.AUTO_LIST, options),
    cancel: (runId) => invokeIpc(IPC_CHANNEL.AUTO_CANCEL, { runId }),
    delete: (runId) => invokeIpc(IPC_CHANNEL.AUTO_DELETE, { runId }),
    retry: (runId) => invokeIpc(IPC_CHANNEL.AUTO_RETRY, { runId }),
    retryItem: (itemId) => invokeIpc(IPC_CHANNEL.AUTO_RETRY_ITEM, { itemId }),
    readScreenshot: (path) => invokeIpc(IPC_CHANNEL.AUTO_READ_SCREENSHOT, { path }),
    onProgress: (callback: (event: AutomationProgressEvent) => void) => {
      const handler = (_event: IpcRendererEvent, data: AutomationProgressEvent) => callback(data);
      ipcRenderer.on(IPC_CHANNEL.AUTO_PROGRESS, handler);
      return () => ipcRenderer.removeListener(IPC_CHANNEL.AUTO_PROGRESS, handler);
    },
    bringToFront: (itemId) => invokeIpc(IPC_CHANNEL.AUTO_BRING_TO_FRONT, { itemId }),
  },

  products: {
    listConfigs: () => invokeIpc(IPC_CHANNEL.PRODUCTS_LIST_CONFIGS),
    getConfig: (flowKey) => invokeIpc(IPC_CHANNEL.PRODUCTS_GET_CONFIG, { flowKey }),
    listActiveConfigs: () => invokeIpc(IPC_CHANNEL.PRODUCTS_LIST_ACTIVE_CONFIGS),
    listStatuses: () => invokeIpc(IPC_CHANNEL.PRODUCTS_LIST_STATUSES),
    getStatus: (platform, product) =>
      invokeIpc(IPC_CHANNEL.PRODUCTS_GET_STATUS, { platform, product }),
    saveStatus: (input) => invokeIpc(IPC_CHANNEL.PRODUCTS_SAVE_STATUS, input),
    updateStatus: (input) => invokeIpc(IPC_CHANNEL.PRODUCTS_UPDATE_STATUS, input),
  },

  flowStates: {
    listPaused: () => invokeIpc(IPC_CHANNEL.FLOW_STATES_LIST_PAUSED),
    get: (id) => invokeIpc(IPC_CHANNEL.FLOW_STATES_GET, { id }),
    delete: (id) => invokeIpc(IPC_CHANNEL.FLOW_STATES_DELETE, { id }),
    resume: (id) => invokeIpc(IPC_CHANNEL.FLOW_STATES_RESUME, { id }),
  },

  dashboard: {
    overview: () => invokeIpc(IPC_CHANNEL.DASHBOARD_OVERVIEW),
  },

  shell: {
    openPath: (path: string) => invokeIpc(IPC_CHANNEL.SHELL_OPEN_PATH, { path }),
    openExternal: (url: string) => invokeIpc(IPC_CHANNEL.SHELL_OPEN_EXTERNAL, { url }),
  },

  automationSettings: {
    get: (flowKey: string) => invokeIpc(IPC_CHANNEL.AUTO_SETTINGS_GET, { flowKey }),
    list: () => invokeIpc(IPC_CHANNEL.AUTO_SETTINGS_LIST),
    save: (flowKey: string, settings: { headless?: boolean; autoSubmit?: boolean }) =>
      invokeIpc(IPC_CHANNEL.AUTO_SETTINGS_SAVE, { flowKey, ...settings }),
  },

  data: {
    exportLeads: () => invokeIpc(IPC_CHANNEL.DATA_EXPORT_LEADS),
    exportDb: () => invokeIpc(IPC_CHANNEL.DATA_EXPORT_DB),
    getLogsPath: () => invokeIpc(IPC_CHANNEL.DATA_GET_LOGS_PATH),
  },

  feedback: {
    send: (data: { message: string; email?: string; name?: string }) =>
      invokeIpc(IPC_CHANNEL.FEEDBACK_SEND, data),
  },

  update: {
    onStatus: (callback: (status: UpdateStatus) => void) => {
      const handler = (_event: IpcRendererEvent, status: UpdateStatus) => callback(status);
      ipcRenderer.on(IPC_CHANNEL.UPDATE_STATUS, handler);
      return () => ipcRenderer.removeListener(IPC_CHANNEL.UPDATE_STATUS, handler);
    },
    check: () => ipcRenderer.invoke(IPC_CHANNEL.UPDATE_CHECK),
    download: () => ipcRenderer.invoke(IPC_CHANNEL.UPDATE_DOWNLOAD),
    install: () => ipcRenderer.invoke(IPC_CHANNEL.UPDATE_INSTALL),
  },

  app: {
    getVersion: () => invokeIpc(IPC_CHANNEL.APP_GET_VERSION),
  },

  devis: {
    list: (options) => invokeIpc(IPC_CHANNEL.DEVIS_LIST, options),
    listByLead: (leadId) => invokeIpc(IPC_CHANNEL.DEVIS_LIST_BY_LEAD, { leadId }),
    get: (id) => invokeIpc(IPC_CHANNEL.DEVIS_GET, { id }),
    create: (input) => invokeIpc(IPC_CHANNEL.DEVIS_CREATE, input),
    update: (id, data) => invokeIpc(IPC_CHANNEL.DEVIS_UPDATE, { id, data }),
    delete: (id) => invokeIpc(IPC_CHANNEL.DEVIS_DELETE, { id }),
    exportPdf: (id) => invokeIpc(IPC_CHANNEL.DEVIS_EXPORT_PDF, { id }),
    duplicate: (id) => invokeIpc(IPC_CHANNEL.DEVIS_DUPLICATE, { id }),
    countByLead: (leadIds) => invokeIpc(IPC_CHANNEL.DEVIS_COUNT_BY_LEAD, { leadIds }),
    stats: () => invokeIpc(IPC_CHANNEL.DEVIS_STATS),
  },

  support: {
    sendLogs: (payload) => invokeIpc(IPC_CHANNEL.SUPPORT_SEND_LOGS, payload),
  },
};

contextBridge.exposeInMainWorld("api", api);

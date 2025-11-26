import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNEL } from "@/main/ipc/channels";
import type { Ipc } from "@/shared/ipc/contracts";

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
    list: (options) => invokeIpc(IPC_CHANNEL.AUTO_LIST, options),
    cancel: (runId) => invokeIpc(IPC_CHANNEL.AUTO_CANCEL, { runId }),
  },
};

contextBridge.exposeInMainWorld("api", api);

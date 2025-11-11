import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNEL } from "@/main/ipc/channels";
import type { Ipc } from "@/shared/ipc/contracts";

const api: Ipc = {
  leads: {
    list: () => ipcRenderer.invoke(IPC_CHANNEL.LEADS_LIST),
    create: (lead) => ipcRenderer.invoke(IPC_CHANNEL.LEADS_CREATE, lead),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNEL.LEADS_REMOVE, id),
  },
  credentials: {
    upsert: (p) => ipcRenderer.invoke(IPC_CHANNEL.CREDS_UPSERT, p),
    test: (platform) => ipcRenderer.invoke(IPC_CHANNEL.CREDS_TEST, platform),
  },
  automation: {
    enqueue: (items) => ipcRenderer.invoke(IPC_CHANNEL.AUTO_ENQUEUE, items),
  },
  flows: {
    list: () => ipcRenderer.invoke(IPC_CHANNEL.FLOWS_LIST),
  },
  mail: {
    status: () => ipcRenderer.invoke(IPC_CHANNEL.MAIL_STATUS),
    connect: () => ipcRenderer.invoke(IPC_CHANNEL.MAIL_CONNECT),
    fetch: (days: number) => ipcRenderer.invoke(IPC_CHANNEL.MAIL_FETCH, days),
  },
};

contextBridge.exposeInMainWorld("api", api);

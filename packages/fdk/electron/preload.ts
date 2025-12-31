import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

console.log('[FDK Preload] Loading preload script...');

// Types matching IPC handlers
export type LeadType = 'solo' | 'conjoint' | 'enfants' | 'famille';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type FlowSource = 'file' | 'database' | 'all';

export interface FlowInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  platform?: string;
  product?: string;
  status?: string;
  source: 'file' | 'database';
  filePath?: string;
}

export interface FlowListOptions {
  source?: FlowSource;
}

export interface FlowStepInfo {
  id: string;
  name: string;
  type: string;
  description?: string;
}

export interface Lead {
  id: string;
  name: string;
  type: LeadType;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  stepId?: string;
  data?: Record<string, unknown>;
}

export interface RunFlowParams {
  flowKey: string;
  lead: Record<string, unknown>;
  credentials?: { username: string; password: string };
}

export interface RunFlowResult {
  success: boolean;
  result?: { executionId: string; status: string };
  error?: string;
}

export interface ListLeadsOptions {
  type?: LeadType;
  limit?: number;
  search?: string;
}

export interface PlatformCredentials {
  platform: string;
  username: string;
  password: string;
  courtierCode?: string;
}

// API interfaces
export interface FlowAPI {
  list: (options?: FlowListOptions) => Promise<FlowInfo[]>;
  load: (flowKey: string) => Promise<{ success: boolean; flow?: FlowInfo; source?: FlowSource; error?: string }>;
  run: (params: RunFlowParams) => Promise<RunFlowResult>;
  stop: (executionId?: string) => Promise<{ success: boolean; error?: string }>;
  export: (flowKey: string) => Promise<{ success: boolean; errors?: unknown[]; warnings?: unknown[] }>;
  getSteps: (flowKey: string) => Promise<{ success: boolean; steps?: FlowStepInfo[]; error?: string }>;
  getYaml: (flowKey: string) => Promise<{ success: boolean; yaml?: string; source?: FlowSource; error?: string }>;
  invalidateCache: (flowKey?: string) => Promise<{ success: boolean }>;
}

export interface LeadAPI {
  list: (options?: ListLeadsOptions) => Promise<Lead[]>;
  get: (leadId: string) => Promise<{ success: boolean; lead?: Lead; error?: string }>;
}

export interface LogAPI {
  subscribe: () => Promise<{ success: boolean }>;
  unsubscribe: () => Promise<{ success: boolean }>;
  onEvent: (callback: (entry: LogEntry) => void) => () => void;
}

export interface CredentialAPI {
  listPlatforms: () => Promise<string[]>;
  get: (platform: string) => Promise<PlatformCredentials | null>;
}

export interface ElectronAPI {
  flow: FlowAPI;
  lead: LeadAPI;
  log: LogAPI;
  credential: CredentialAPI;
  platform: NodeJS.Platform;
}

const flowAPI: FlowAPI = {
  list: (options) => ipcRenderer.invoke('flow:list', options),
  load: (flowKey) => ipcRenderer.invoke('flow:load', flowKey),
  run: (params) => ipcRenderer.invoke('flow:run', params),
  stop: (executionId) => ipcRenderer.invoke('flow:stop', executionId),
  export: (flowKey) => ipcRenderer.invoke('flow:export', flowKey),
  getSteps: (flowKey) => ipcRenderer.invoke('flow:get-steps', flowKey),
  getYaml: (flowKey) => ipcRenderer.invoke('flow:get-yaml', flowKey),
  invalidateCache: (flowKey) => ipcRenderer.invoke('flow:invalidate-cache', flowKey),
};

const leadAPI: LeadAPI = {
  list: (options) => ipcRenderer.invoke('lead:list', options),
  get: (leadId) => ipcRenderer.invoke('lead:get', leadId),
};

const logAPI: LogAPI = {
  subscribe: () => ipcRenderer.invoke('log:subscribe'),
  unsubscribe: () => ipcRenderer.invoke('log:unsubscribe'),
  onEvent: (callback) => {
    const handler = (_event: IpcRendererEvent, entry: LogEntry) => callback(entry);
    ipcRenderer.on('log:event', handler);
    return () => ipcRenderer.removeListener('log:event', handler);
  },
};

const credentialAPI: CredentialAPI = {
  listPlatforms: () => ipcRenderer.invoke('credential:list-platforms'),
  get: (platform) => ipcRenderer.invoke('credential:get', platform),
};

contextBridge.exposeInMainWorld('electron', {
  flow: flowAPI,
  lead: leadAPI,
  log: logAPI,
  credential: credentialAPI,
  platform: process.platform,
});

console.log('[FDK Preload] API exposed to window.electron');

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

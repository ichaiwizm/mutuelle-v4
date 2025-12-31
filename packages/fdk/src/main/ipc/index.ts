/**
 * IPC Handler Registration
 * Centralizes all IPC handler registration for the Electron main process
 */
import { ipcMain } from 'electron';
import { FLOW_CHANNELS, LEAD_CHANNELS, LOG_CHANNELS, PUBLISH_CHANNELS, CREDENTIAL_CHANNELS } from './channels';
import {
  handleFlowList,
  handleFlowLoad,
  handleFlowRun,
  handleFlowStop,
  handleFlowExport,
  handleFlowGetSteps,
  handleFlowGetYaml,
  handleFlowInvalidateCache,
} from './handlers/flow-handlers';
import { handleLeadList, handleLeadGet } from './handlers/lead-handlers';
import { handleLogSubscribe, handleLogUnsubscribe } from './handlers/log-handlers';
import { handleFlowPublish, handlePublishedFlowList } from './handlers/publish-handlers';
import { handleCredentialListPlatforms, handleCredentialGet } from './handlers/credential-handlers';

/** Register all IPC handlers with ipcMain */
export function registerIpcHandlers(): void {
  // Flow handlers
  ipcMain.handle(FLOW_CHANNELS.LIST, handleFlowList);
  ipcMain.handle(FLOW_CHANNELS.LOAD, handleFlowLoad);
  ipcMain.handle(FLOW_CHANNELS.RUN, handleFlowRun);
  ipcMain.handle(FLOW_CHANNELS.STOP, handleFlowStop);
  ipcMain.handle(FLOW_CHANNELS.EXPORT, handleFlowExport);
  ipcMain.handle(FLOW_CHANNELS.GET_STEPS, handleFlowGetSteps);
  ipcMain.handle(FLOW_CHANNELS.GET_YAML, handleFlowGetYaml);
  ipcMain.handle(FLOW_CHANNELS.INVALIDATE_CACHE, handleFlowInvalidateCache);

  // Lead handlers
  ipcMain.handle(LEAD_CHANNELS.LIST, handleLeadList);
  ipcMain.handle(LEAD_CHANNELS.GET, handleLeadGet);

  // Log handlers
  ipcMain.handle(LOG_CHANNELS.SUBSCRIBE, handleLogSubscribe);
  ipcMain.handle(LOG_CHANNELS.UNSUBSCRIBE, handleLogUnsubscribe);

  // Publish handlers
  ipcMain.handle(PUBLISH_CHANNELS.PUBLISH, handleFlowPublish);
  ipcMain.handle(PUBLISH_CHANNELS.LIST, handlePublishedFlowList);

  // Credential handlers
  ipcMain.handle(CREDENTIAL_CHANNELS.LIST_PLATFORMS, handleCredentialListPlatforms);
  ipcMain.handle(CREDENTIAL_CHANNELS.GET, handleCredentialGet);
}

/** Unregister all IPC handlers (useful for cleanup/testing) */
export function unregisterIpcHandlers(): void {
  // Flow handlers
  ipcMain.removeHandler(FLOW_CHANNELS.LIST);
  ipcMain.removeHandler(FLOW_CHANNELS.LOAD);
  ipcMain.removeHandler(FLOW_CHANNELS.RUN);
  ipcMain.removeHandler(FLOW_CHANNELS.STOP);
  ipcMain.removeHandler(FLOW_CHANNELS.EXPORT);
  ipcMain.removeHandler(FLOW_CHANNELS.GET_STEPS);
  ipcMain.removeHandler(FLOW_CHANNELS.GET_YAML);
  ipcMain.removeHandler(FLOW_CHANNELS.INVALIDATE_CACHE);

  // Lead handlers
  ipcMain.removeHandler(LEAD_CHANNELS.LIST);
  ipcMain.removeHandler(LEAD_CHANNELS.GET);

  // Log handlers
  ipcMain.removeHandler(LOG_CHANNELS.SUBSCRIBE);
  ipcMain.removeHandler(LOG_CHANNELS.UNSUBSCRIBE);

  // Publish handlers
  ipcMain.removeHandler(PUBLISH_CHANNELS.PUBLISH);
  ipcMain.removeHandler(PUBLISH_CHANNELS.LIST);

  // Credential handlers
  ipcMain.removeHandler(CREDENTIAL_CHANNELS.LIST_PLATFORMS);
  ipcMain.removeHandler(CREDENTIAL_CHANNELS.GET);
}

// Re-export channels and types
export * from './channels';
export type { RunFlowParams, RunFlowResult, FlowStepInfo } from './handlers/flow-handlers';
export type { FlowInfo } from '../db/flow-loader';
export type { Lead, LeadType, ListLeadsOptions } from './handlers/lead-handlers';
export type { LogEntry, LogLevel } from './handlers/log-handlers';
export { emitLog, createExecutionLogger } from './handlers/log-handlers';
export type { PublishResult, PublishedFlowInfo } from './handlers/publish-handlers';
export type { PlatformCredentials } from '../db/credential-repository';

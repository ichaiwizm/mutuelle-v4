/**
 * IPC Channel Definitions
 * Centralized channel names for Electron IPC communication
 */

// Flow operations
export const FLOW_CHANNELS = {
  LIST: 'flow:list',
  LOAD: 'flow:load',
  RUN: 'flow:run',
  STOP: 'flow:stop',
  EXPORT: 'flow:export',
  GET_STEPS: 'flow:get-steps',
  GET_YAML: 'flow:get-yaml',
  INVALIDATE_CACHE: 'flow:invalidate-cache',
} as const;

// Lead operations
export const LEAD_CHANNELS = {
  LIST: 'lead:list',
  GET: 'lead:get',
} as const;

// Log operations
export const LOG_CHANNELS = {
  SUBSCRIBE: 'log:subscribe',
  UNSUBSCRIBE: 'log:unsubscribe',
  EVENT: 'log:event',
} as const;

// Publish operations
export const PUBLISH_CHANNELS = {
  PUBLISH: 'flow:publish',
  LIST: 'flow:published:list',
} as const;

// Credential operations
export const CREDENTIAL_CHANNELS = {
  LIST_PLATFORMS: 'credential:list-platforms',
  GET: 'credential:get',
} as const;

// All channels combined
export const IPC_CHANNELS = {
  ...FLOW_CHANNELS,
  ...LEAD_CHANNELS,
  ...LOG_CHANNELS,
  ...PUBLISH_CHANNELS,
  ...CREDENTIAL_CHANNELS,
} as const;

export type FlowChannel = (typeof FLOW_CHANNELS)[keyof typeof FLOW_CHANNELS];
export type LeadChannel = (typeof LEAD_CHANNELS)[keyof typeof LEAD_CHANNELS];
export type LogChannel = (typeof LOG_CHANNELS)[keyof typeof LOG_CHANNELS];
export type PublishChannel = (typeof PUBLISH_CHANNELS)[keyof typeof PUBLISH_CHANNELS];
export type CredentialChannel = (typeof CREDENTIAL_CHANNELS)[keyof typeof CREDENTIAL_CHANNELS];
export type IpcChannel = FlowChannel | LeadChannel | LogChannel | PublishChannel | CredentialChannel;

/**
 * Flow Engine - Main exports
 *
 * This module provides the YAML-based flow execution engine.
 * Old step-based flow engine (FlowEngine, StepRegistry, BaseStep) has been removed
 * in favor of the YAML engine adapter.
 */

export { FlowLogger } from "./FlowLogger";

// Types
export type {
  ExecutionContext,
  StepResult,
  FlowExecutionConfig,
  FlowExecutionResult,
  PlatformCredentials,
  FlowHooks,
  FlowEventType,
  FlowEventData,
  FlowState,
  FlowStateStatus,
} from "./types";

export type { LogLevel, LogEntry } from "./FlowLogger";

// Core utilities (moved to packages/engine)

// Hooks
export { HooksManager } from "./hooks";

// Pause/Resume
export { PauseResumeManager } from "./pause";

// Pool (parallel execution)
export { FlowPool, FlowWorker, BrowserManager } from "./pool";
export type {
  FlowTask,
  FlowPoolConfig,
  FlowPoolResult,
  WorkerStatus,
  FlowPoolEvents,
} from "./pool";

// YAML Engine Adapter (loads flows from DB)
export { YamlEngineAdapter, yamlEngineAdapter } from "./yaml-engine-adapter";
export type { ExecuteOptions, LoadedFlow } from "./yaml-engine-adapter";
export { FlowLoader, flowLoader } from "./flow-loader";
export type { CachedFlow } from "./flow-loader";
export { CredentialAdapter, credentialAdapter } from "./credential-adapter";
export type { CredentialAdapterOptions } from "./credential-adapter";

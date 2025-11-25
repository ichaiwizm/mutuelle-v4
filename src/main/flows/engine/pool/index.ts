/**
 * Flow Pool - Parallel Flow Execution
 *
 * This module provides components for executing multiple flows in parallel
 * with isolated browser contexts.
 */

export { FlowPool } from "./FlowPool";
export { FlowWorker } from "./FlowWorker";
export { BrowserManager } from "./BrowserManager";
export { QueueProcessor } from "./QueueProcessor";

// Types
export type {
  FlowTask,
  FlowPoolConfig,
  FlowPoolResult,
  WorkerStatus,
  QueuedTask,
  FlowPoolEvents,
} from "./types";

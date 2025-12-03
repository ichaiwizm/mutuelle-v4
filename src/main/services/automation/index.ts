/**
 * Automation Service - Orchestrates automation runs and flow execution
 *
 * This module is divided into:
 * - types.ts: Type definitions
 * - utils.ts: Utility functions
 * - progressHooks.ts: Step progress tracking and broadcasting
 * - runManager.ts: Run CRUD operations
 * - itemManager.ts: Item operations and retry logic
 * - queueManager.ts: Task queuing and execution
 */

import {
  getRun,
  getRunOrThrow,
  listRuns,
  cancelRun,
  deleteRun,
  cleanupOnShutdown,
  cleanupOrphanedRuns,
} from "./runManager";
import { getItem, retryRun, retryItem } from "./itemManager";
import { enqueueRun } from "./queueManager";

// Re-export types
export type { Run, RunItem } from "@/shared/types/run";
export type { RunStatus, RunWithItems, EnqueueItem } from "./types";

/**
 * Automation Service API
 *
 * Provides a unified interface for managing automation runs.
 */
export const AutomationService = {
  // Run operations
  get: getRun,
  getOrThrow: getRunOrThrow,
  list: listRuns,
  cancel: cancelRun,
  delete: deleteRun,

  // Item operations
  getItem,
  retry: retryRun,
  retryItem,

  // Queue operations
  enqueue: enqueueRun,

  // Lifecycle
  cleanupOnShutdown,
  cleanupOrphanedRuns,
};

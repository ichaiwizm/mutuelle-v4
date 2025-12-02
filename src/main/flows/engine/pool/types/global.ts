import type { LaunchOptions } from "playwright";
import type { FlowTask, QueuedTask } from "../types";
import type { FlowExecutionResult } from "../../types";

/**
 * Configuration for the GlobalFlowPool
 */
export type GlobalPoolConfig = {
  /** Maximum number of concurrent flows across ALL runs. Default: 5 */
  maxConcurrent?: number;
  /** Playwright browser launch options */
  browserOptions?: LaunchOptions;
};

/**
 * Callbacks for run-specific task lifecycle events
 */
export type TaskCallbacks = {
  onStart: (taskId: string) => Promise<void>;
  onComplete: (taskId: string, result: FlowExecutionResult) => Promise<void>;
  onError: (taskId: string, error: Error) => Promise<void>;
};

/**
 * A task in the global queue, extended with run association
 */
export type GlobalTask = QueuedTask & {
  /** The run this task belongs to */
  runId: string;
  /** Callbacks to update the run's DB records */
  callbacks: TaskCallbacks;
};

/**
 * Handle for tracking a run's lifecycle within the global pool
 */
export type RunHandle = {
  /** Unique run identifier */
  runId: string;
  /** All task IDs belonging to this run */
  taskIds: Set<string>;
  /** Total number of tasks for this run */
  totalCount: number;
  /** Number of tasks completed (success, failed, or cancelled) */
  completedCount: number;
  /** AbortController for this run's tasks */
  abortController: AbortController;
  /** Promise that resolves when all run tasks are done */
  completionPromise: Promise<void>;
  /** Resolver for the completion promise */
  resolve: () => void;
};

/**
 * Result of the global pool execution for a specific run
 */
export type GlobalPoolRunResult = {
  runId: string;
  total: number;
  successful: number;
  failed: number;
  cancelled: number;
};

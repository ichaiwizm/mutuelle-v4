import type { LaunchOptions } from "playwright";
import type { Lead } from "../../../../shared/types/lead";
import type { FlowExecutionResult, FlowExecutionConfig } from "../types";

/**
 * A task representing a single flow to be executed
 */
export type FlowTask = {
  id: string;
  flowKey: string;
  leadId: string;
  lead: Lead;
  transformedData?: unknown;
  artifactsDir?: string;
  /** Optional priority (higher = executed first). Default: 0 */
  priority?: number;
  /** Optional flow execution config overrides */
  flowConfig?: Omit<FlowExecutionConfig, "stateId">;
};

/**
 * Configuration for the FlowPool
 */
export type FlowPoolConfig = {
  /** Maximum number of concurrent flows. Default: 3 */
  maxConcurrent?: number;
  /** Playwright browser launch options */
  browserOptions?: LaunchOptions;
  /** Called when a task completes (success or failure) */
  onTaskComplete?: (taskId: string, result: FlowExecutionResult) => void;
  /** Called when a task encounters an error */
  onTaskError?: (taskId: string, error: Error) => void;
  /** Called when a task starts */
  onTaskStart?: (taskId: string) => void;
};

/**
 * Result of a FlowPool execution
 */
export type FlowPoolResult = {
  /** Total number of tasks processed */
  total: number;
  /** Number of successful tasks */
  successful: number;
  /** Number of failed tasks */
  failed: number;
  /** Total execution time in ms */
  duration: number;
  /** Individual results by task ID */
  results: Map<string, FlowExecutionResult>;
};

/**
 * Status of a FlowWorker
 */
export type WorkerStatus = "idle" | "running" | "error" | "completed";

/**
 * Internal representation of a task in the queue
 */
export type QueuedTask = FlowTask & {
  queuedAt: number;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
};

/**
 * Events emitted by FlowPool
 */
export type FlowPoolEvents = {
  "task:queued": (taskId: string) => void;
  "task:start": (taskId: string) => void;
  "task:complete": (taskId: string, result: FlowExecutionResult) => void;
  "task:error": (taskId: string, error: Error) => void;
  "pool:start": () => void;
  "pool:complete": (result: FlowPoolResult) => void;
  "pool:error": (error: Error) => void;
};

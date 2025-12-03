import type { LaunchOptions } from "playwright";
import type { Lead } from "../../../../shared/types/lead";
import type { FlowExecutionResult, FlowExecutionConfig } from "../types";

/**
 * Automation settings for visible mode and manual takeover
 */
export type TaskAutomationSettings = {
  /** If false, browser runs in visible (non-headless) mode */
  headless: boolean;
  /** Step ID to stop at for manual takeover (null = run all steps) */
  stopAtStep: string | null;
};

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
  /** Optional automation settings for visible mode / manual takeover */
  automationSettings?: TaskAutomationSettings;
  /** Run ID this task belongs to */
  runId?: string;
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

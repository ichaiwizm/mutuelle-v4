import type { QueuedTask } from "./types";
import type { FlowExecutionResult } from "../types";
import type { BrowserManager } from "./BrowserManager";
import { FlowWorker } from "./FlowWorker";
import type { EventEmitter } from "events";
import type { FlowPoolConfig } from "./types";

export type TaskRunnerDeps = {
  browserManager: BrowserManager;
  config: FlowPoolConfig;
  emitter: EventEmitter;
  activeWorkers: Map<string, FlowWorker>;
};

export async function executeTask(
  deps: TaskRunnerDeps,
  task: QueuedTask,
  abortSignal: AbortSignal | null
): Promise<FlowExecutionResult> {
  const context = await deps.browserManager.createContext();
  const worker = new FlowWorker(task.id, context);
  deps.activeWorkers.set(task.id, worker);
  deps.config.onTaskStart?.(task.id);
  deps.emitter.emit("task:start", task.id);
  let skipCleanup = false;
  try {
    const result = await worker.execute(task, abortSignal ?? undefined);
    if (result.waitingUser) skipCleanup = true;
    return result;
  } finally {
    if (!skipCleanup) {
      await worker.cleanup();
      await deps.browserManager.closeContext(context);
      deps.activeWorkers.delete(task.id);
    }
  }
}

export function handleTaskSuccess(
  deps: TaskRunnerDeps,
  task: QueuedTask,
  result: FlowExecutionResult,
  results: Map<string, FlowExecutionResult>
): void {
  task.status = "completed";
  results.set(task.id, result);
  console.log(`[TASK_COMPLETE] ${task.flowKey} (Lead: ${task.leadId?.substring(0, 8)}...) | Success: ${result.success} | Duration: ${result.totalDuration}ms`);
  deps.config.onTaskComplete?.(task.id, result);
  deps.emitter.emit("task:complete", task.id, result);
}

export function handleTaskError(
  deps: TaskRunnerDeps,
  task: QueuedTask,
  error: unknown,
  results: Map<string, FlowExecutionResult>
): void {
  task.status = "failed";
  const err = error instanceof Error ? error : new Error(String(error));
  console.log(`[TASK_ERROR] ${task.flowKey} (Lead: ${task.leadId?.substring(0, 8)}...) | Error: ${err.message}`);
  const failedResult: FlowExecutionResult = {
    success: false,
    flowKey: task.flowKey,
    leadId: task.leadId,
    steps: [],
    totalDuration: 0,
    error: err,
  };
  results.set(task.id, failedResult);
  deps.config.onTaskError?.(task.id, err);
  deps.emitter.emit("task:error", task.id, err);
}

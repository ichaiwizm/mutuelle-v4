import type { QueuedTask, FlowPoolConfig } from "./types";
import type { FlowExecutionResult } from "../types";
import type { BrowserManager } from "./BrowserManager";
import { FlowWorker } from "./FlowWorker";
import type { EventEmitter } from "events";

type ProcessorDeps = {
  browserManager: BrowserManager;
  config: FlowPoolConfig;
  emitter: EventEmitter;
  activeWorkers: Map<string, FlowWorker>;
};

/**
 * Handles the queue processing logic for FlowPool.
 * Manages concurrency control and task execution.
 */
export class QueueProcessor {
  private deps: ProcessorDeps;
  private maxConcurrent: number;
  private isPaused = false;
  private abortSignal: AbortSignal | null = null;

  constructor(deps: ProcessorDeps, maxConcurrent: number) {
    this.deps = deps;
    this.maxConcurrent = maxConcurrent;
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  setAbortSignal(signal: AbortSignal): void {
    this.abortSignal = signal;
  }

  /**
   * Process all tasks in the queue with concurrency control.
   */
  async process(
    queue: QueuedTask[],
    results: Map<string, FlowExecutionResult>
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let completed = 0;
      let running = 0;
      let index = 0;
      const total = queue.length;

      const processNext = async (): Promise<void> => {
        // Check for abort
        if (this.abortSignal?.aborted) {
          // Mark remaining queued tasks as cancelled
          for (const task of queue) {
            if (task.status === "queued") {
              task.status = "cancelled";
            }
          }
          resolve();
          return;
        }

        if (this.isPaused) {
          if (running === 0) resolve();
          return;
        }

        while (running < this.maxConcurrent && index < queue.length) {
          // Check abort before starting each task
          if (this.abortSignal?.aborted) {
            for (const task of queue) {
              if (task.status === "queued") {
                task.status = "cancelled";
              }
            }
            if (running === 0) resolve();
            return;
          }

          const task = queue[index];
          if (task.status !== "queued") {
            index++;
            continue;
          }

          task.status = "running";
          index++;
          running++;

          this.executeTask(task)
            .then((result) => this.handleSuccess(task, result, results))
            .catch((error) => this.handleError(task, error, results))
            .finally(() => {
              running--;
              completed++;
              completed >= total ? resolve() : processNext();
            });
        }

        if (running === 0 && index >= queue.length) resolve();
      };

      processNext().catch(reject);
    });
  }

  private async executeTask(task: QueuedTask): Promise<FlowExecutionResult> {
    const context = await this.deps.browserManager.createContext();
    const worker = new FlowWorker(task.id, context);

    this.deps.activeWorkers.set(task.id, worker);
    this.deps.config.onTaskStart?.(task.id);
    this.deps.emitter.emit("task:start", task.id);

    let skipCleanup = false;

    try {
      const result = await worker.execute(task, this.abortSignal ?? undefined);

      // Don't cleanup if task is in waiting_user state - keep browser window open
      if (result.waitingUser) {
        skipCleanup = true;
      }

      return result;
    } finally {
      if (!skipCleanup) {
        await worker.cleanup();
        await this.deps.browserManager.closeContext(context);
        this.deps.activeWorkers.delete(task.id);
      }
    }
  }

  private handleSuccess(
    task: QueuedTask,
    result: FlowExecutionResult,
    results: Map<string, FlowExecutionResult>
  ): void {
    task.status = "completed";
    results.set(task.id, result);

    console.log(`[TASK_COMPLETE] ${task.flowKey} (Lead: ${task.leadId?.substring(0, 8)}...) | Success: ${result.success} | Duration: ${result.totalDuration}ms`);

    this.deps.config.onTaskComplete?.(task.id, result);
    this.deps.emitter.emit("task:complete", task.id, result);
  }

  private handleError(
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
    this.deps.config.onTaskError?.(task.id, err);
    this.deps.emitter.emit("task:error", task.id, err);
  }
}

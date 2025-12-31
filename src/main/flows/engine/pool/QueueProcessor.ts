import type { QueuedTask, FlowPoolConfig } from "./types";
import type { FlowExecutionResult } from "../types";
import type { BrowserManager } from "./BrowserManager";
import { FlowWorker } from "./FlowWorker";
import type { EventEmitter } from "events";
import { BaseQueueProcessor } from "./BaseQueueProcessor";
import { executeTask, handleTaskSuccess, handleTaskError, type TaskRunnerDeps } from "./TaskRunner";

export class QueueProcessor extends BaseQueueProcessor {
  private deps: TaskRunnerDeps;
  private abortSignal: AbortSignal | null = null;
  private currentQueue: QueuedTask[] = [];
  private runningCount = 0;

  constructor(deps: TaskRunnerDeps, maxConcurrent: number) {
    super(maxConcurrent);
    this.deps = deps;
  }

  protected getRunningCount(): number {
    return this.runningCount;
  }

  protected hasQueuedTasks(): boolean {
    return this.currentQueue.some((t) => t.status === "queued");
  }

  setAbortSignal(signal: AbortSignal): void {
    this.abortSignal = signal;
  }

  async process(queue: QueuedTask[], results: Map<string, FlowExecutionResult>): Promise<void> {
    this.currentQueue = queue;
    this.runningCount = 0;
    return new Promise((resolve, reject) => {
      let completed = 0, index = 0;
      const total = queue.length;
      const processNext = async (): Promise<void> => {
        if (this.abortSignal?.aborted) {
          this.cancelRemainingTasks();
          resolve();
          return;
        }
        if (this.isPaused) {
          if (this.runningCount === 0) resolve();
          return;
        }
        while (this.canStartMore() && index < queue.length) {
          if (this.abortSignal?.aborted) {
            this.cancelRemainingTasks();
            if (this.runningCount === 0) resolve();
            return;
          }
          const task = queue[index];
          if (task.status !== "queued") { index++; continue; }
          task.status = "running";
          index++;
          this.runningCount++;
          executeTask(this.deps, task, this.abortSignal)
            .then((result) => handleTaskSuccess(this.deps, task, result, results))
            .catch((error) => handleTaskError(this.deps, task, error, results))
            .finally(() => {
              this.runningCount--;
              completed++;
              completed >= total ? resolve() : processNext();
            });
        }
        if (this.runningCount === 0 && index >= queue.length) resolve();
      };
      processNext().catch(reject);
    });
  }

  private cancelRemainingTasks(): void {
    for (const task of this.currentQueue) {
      if (task.status === "queued") task.status = "cancelled";
    }
  }
}

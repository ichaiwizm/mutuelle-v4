import type { BrowserContext } from "playwright";
import type { GlobalTask, RunHandle } from "../types/global";
import { BrowserManager } from "../BrowserManager";
import { FlowWorker } from "../FlowWorker";

export class TaskExecutor {
  private activeWorkers: Map<string, FlowWorker> = new Map();
  private pendingTasks: Set<string> = new Set();
  private browserManager: BrowserManager;

  constructor(browserManager: BrowserManager) {
    this.browserManager = browserManager;
  }

  get activeCount(): number {
    return this.activeWorkers.size + this.pendingTasks.size;
  }

  /**
   * Execute a single task.
   */
  async execute(
    task: GlobalTask,
    handle: RunHandle | undefined,
    onTaskComplete: () => void,
    removeTaskFromQueue: (taskId: string) => void
  ): Promise<void> {
    // Reserve slot immediately to prevent race condition
    this.pendingTasks.add(task.id);

    // Check if run was cancelled
    if (!handle || handle.abortController.signal.aborted) {
      this.pendingTasks.delete(task.id);
      task.status = "cancelled";
      removeTaskFromQueue(task.id);
      return;
    }

    console.log(
      `[GLOBAL_POOL] Starting task ${task.id.substring(0, 8)}... (${task.flowKey}) | Run: ${task.runId.substring(0, 8)}...`
    );

    const context = await this.browserManager.createContext();
    const worker = new FlowWorker(task.id, context);

    // Transfer from pending to active
    this.pendingTasks.delete(task.id);
    this.activeWorkers.set(task.id, worker);

    try {
      // Notify start
      await task.callbacks.onStart(task.id);

      // Execute with run's abort signal
      const result = await worker.execute(task, handle.abortController.signal);

      // Handle result
      if (result.aborted) {
        task.status = "cancelled";
        console.log(`[GLOBAL_POOL] Task ${task.id.substring(0, 8)}... aborted`);
      } else if (result.success) {
        task.status = "completed";
        await task.callbacks.onComplete(task.id, result);
        console.log(
          `[GLOBAL_POOL] Task ${task.id.substring(0, 8)}... completed | Duration: ${result.totalDuration}ms`
        );
      } else {
        task.status = "failed";
        await task.callbacks.onComplete(task.id, result);
        console.log(
          `[GLOBAL_POOL] Task ${task.id.substring(0, 8)}... failed: ${result.error?.message}`
        );
      }
    } catch (error) {
      task.status = "failed";
      const err = error instanceof Error ? error : new Error(String(error));
      await task.callbacks.onError(task.id, err);
      console.error(
        `[GLOBAL_POOL] Task ${task.id.substring(0, 8)}... error:`,
        err.message
      );
    } finally {
      // Cleanup
      await worker.cleanup();
      await this.browserManager.closeContext(context);
      this.activeWorkers.delete(task.id);
      removeTaskFromQueue(task.id);

      // Notify completion
      onTaskComplete();
    }
  }

  /**
   * Abort workers for a specific run.
   */
  async abortWorkersForRun(taskIds: Set<string>): Promise<void> {
    const runningWorkers = Array.from(this.activeWorkers.entries()).filter(
      ([taskId]) => taskIds.has(taskId)
    );

    if (runningWorkers.length > 0) {
      console.log(`[GLOBAL_POOL] Aborting ${runningWorkers.length} running tasks`);
      await Promise.all(
        runningWorkers.map(([, worker]) =>
          worker.abort().catch(() => {
            /* ignore */
          })
        )
      );
    }
  }

  /**
   * Clear all active workers.
   */
  clear(): void {
    this.activeWorkers.clear();
    this.pendingTasks.clear();
  }
}

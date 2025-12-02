import type { FlowTask } from "./types";
import type { GlobalPoolConfig, GlobalTask, TaskCallbacks, RunHandle } from "./types/global";
import { BrowserManager } from "./BrowserManager";
import { FlowWorker } from "./FlowWorker";
import { TaskQueue } from "./TaskQueue";

const DEFAULT_MAX_CONCURRENT = 5;

/**
 * Singleton pool that manages flow execution across ALL runs.
 *
 * Unlike FlowPool (per-run), GlobalFlowPool enforces a global concurrency limit
 * regardless of how many runs are active. Tasks from different runs interleave
 * in a FIFO queue with priority support.
 *
 * @example
 * ```typescript
 * const pool = GlobalFlowPool.getInstance();
 *
 * // Enqueue tasks for run A
 * await pool.enqueueRun(runIdA, tasksA, callbacksA);
 *
 * // Enqueue tasks for run B (will share the global limit with run A)
 * await pool.enqueueRun(runIdB, tasksB, callbacksB);
 *
 * // Cancel only run A
 * await pool.cancelRun(runIdA);
 * ```
 */
export class GlobalFlowPool {
  private static instance: GlobalFlowPool | null = null;

  private taskQueue: TaskQueue = new TaskQueue();
  private activeWorkers: Map<string, FlowWorker> = new Map();
  private runs: Map<string, RunHandle> = new Map();
  private browserManager: BrowserManager;
  private maxConcurrent: number;
  private isProcessing = false;
  private config: GlobalPoolConfig;

  private constructor(config: GlobalPoolConfig = {}) {
    this.config = config;
    this.maxConcurrent = config.maxConcurrent ?? DEFAULT_MAX_CONCURRENT;
    this.browserManager = new BrowserManager(config.browserOptions);
  }

  /**
   * Get the singleton instance of GlobalFlowPool.
   * Creates the instance on first call.
   */
  static getInstance(config?: GlobalPoolConfig): GlobalFlowPool {
    if (!GlobalFlowPool.instance) {
      GlobalFlowPool.instance = new GlobalFlowPool(config);
    }
    return GlobalFlowPool.instance;
  }

  /**
   * Reset the singleton instance (for testing).
   */
  static async resetInstance(): Promise<void> {
    if (GlobalFlowPool.instance) {
      await GlobalFlowPool.instance.shutdown();
      GlobalFlowPool.instance = null;
    }
  }

  /**
   * Enqueue tasks for a specific run.
   * Returns a promise that resolves when ALL tasks of this run are completed.
   */
  async enqueueRun(
    runId: string,
    tasks: FlowTask[],
    callbacks: TaskCallbacks
  ): Promise<void> {
    if (tasks.length === 0) return;

    // Create run handle with completion promise
    let resolve: () => void;
    const completionPromise = new Promise<void>((r) => {
      resolve = r;
    });

    const handle: RunHandle = {
      runId,
      taskIds: new Set(tasks.map((t) => t.id)),
      totalCount: tasks.length,
      completedCount: 0,
      abortController: new AbortController(),
      completionPromise,
      resolve: resolve!,
    };

    this.runs.set(runId, handle);

    // Create global tasks with run association
    const globalTasks: GlobalTask[] = tasks.map((task) => ({
      ...task,
      runId,
      queuedAt: Date.now(),
      status: "queued" as const,
      callbacks,
    }));

    // Add to queue (TaskQueue handles priority sorting)
    this.taskQueue.add(globalTasks);

    console.log(
      `[GLOBAL_POOL] Enqueued ${tasks.length} tasks for run ${runId.substring(0, 8)}... | Queue: ${this.taskQueue.length} | Active: ${this.activeWorkers.size}`
    );

    // Start processing if not already running
    this.startProcessing();

    return completionPromise;
  }

  /**
   * Cancel all pending and running tasks for a specific run.
   * - Pending tasks are removed from queue immediately
   * - Running tasks receive abort signal
   */
  async cancelRun(runId: string): Promise<void> {
    const handle = this.runs.get(runId);
    if (!handle) return;

    console.log(`[GLOBAL_POOL] Cancelling run ${runId.substring(0, 8)}...`);

    // Signal abort to all tasks of this run
    handle.abortController.abort();

    // Remove pending tasks from queue
    const removedCount = this.taskQueue.removeQueuedTasksForRun(runId);
    handle.completedCount += removedCount;

    console.log(
      `[GLOBAL_POOL] Removed ${removedCount} pending tasks from queue`
    );

    // Abort running workers for this run
    const runningWorkers = Array.from(this.activeWorkers.entries()).filter(
      ([taskId]) => handle.taskIds.has(taskId)
    );

    if (runningWorkers.length > 0) {
      console.log(
        `[GLOBAL_POOL] Aborting ${runningWorkers.length} running tasks`
      );
      await Promise.all(
        runningWorkers.map(([, worker]) =>
          worker.abort().catch(() => {
            /* ignore */
          })
        )
      );
    }

    // Check if run is complete
    if (handle.completedCount >= handle.totalCount) {
      this.runs.delete(runId);
      handle.resolve();
    }
  }

  /**
   * Get the current queue length.
   */
  get queueLength(): number {
    return this.taskQueue.queuedCount;
  }

  /**
   * Get the number of active workers.
   */
  get activeCount(): number {
    return this.activeWorkers.size;
  }

  /**
   * Get the number of active runs.
   */
  get activeRunCount(): number {
    return this.runs.size;
  }

  /**
   * Shutdown the global pool and release all resources.
   */
  async shutdown(): Promise<void> {
    console.log("[GLOBAL_POOL] Shutting down...");

    // Abort all runs
    for (const [runId] of this.runs) {
      await this.cancelRun(runId);
    }

    // Close browser
    await this.browserManager.close();

    this.taskQueue.clear();
    this.activeWorkers.clear();
    this.runs.clear();
    this.isProcessing = false;
  }

  /**
   * Start processing the queue if not already running.
   */
  private startProcessing(): void {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.processQueue().catch((error) => {
      console.error("[GLOBAL_POOL] Processing error:", error);
      this.isProcessing = false;
    });
  }

  /**
   * Main processing loop - runs tasks respecting the global concurrency limit.
   */
  private async processQueue(): Promise<void> {
    // Ensure browser is launched
    if (!this.browserManager.isRunning()) {
      await this.browserManager.launch();
    }

    while (this.hasWork()) {
      // Fill up to maxConcurrent workers
      while (
        this.activeWorkers.size < this.maxConcurrent &&
        this.hasQueuedTasks()
      ) {
        const task = this.getNextTask();
        if (!task) break;

        // Don't await - run concurrently
        this.executeTask(task);
      }

      // Wait a bit before checking again if we're at capacity
      if (this.hasWork()) {
        await this.waitForWorkerSlot();
      }
    }

    // All done - close browser if no more work
    if (this.taskQueue.isEmpty && this.runs.size === 0) {
      await this.browserManager.close();
    }

    this.isProcessing = false;
  }

  /**
   * Check if there's work to do.
   */
  private hasWork(): boolean {
    return this.hasQueuedTasks() || this.activeWorkers.size > 0;
  }

  /**
   * Check if there are queued tasks.
   */
  private hasQueuedTasks(): boolean {
    return this.taskQueue.hasQueuedTasks();
  }

  /**
   * Get the next queued task (respects priority, FIFO within same priority).
   */
  private getNextTask(): GlobalTask | undefined {
    return this.taskQueue.getNext();
  }

  /**
   * Wait for a worker slot to become available.
   */
  private waitForWorkerSlot(): Promise<void> {
    return new Promise((resolve) => {
      const check = (): void => {
        if (
          this.activeWorkers.size < this.maxConcurrent ||
          !this.hasQueuedTasks()
        ) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  /**
   * Execute a single task.
   */
  private async executeTask(task: GlobalTask): Promise<void> {
    const handle = this.runs.get(task.runId);

    // Check if run was cancelled
    if (!handle || handle.abortController.signal.aborted) {
      task.status = "cancelled";
      this.removeTaskFromQueue(task.id);
      return;
    }

    console.log(
      `[GLOBAL_POOL] Starting task ${task.id.substring(0, 8)}... (${task.flowKey}) | Run: ${task.runId.substring(0, 8)}...`
    );

    const context = await this.browserManager.createContext();
    const worker = new FlowWorker(task.id, context);
    this.activeWorkers.set(task.id, worker);

    try {
      // Notify start
      await task.callbacks.onStart(task.id);

      // Execute with run's abort signal
      const result = await worker.execute(task, handle.abortController.signal);

      // Handle result
      if (result.aborted) {
        task.status = "cancelled";
        console.log(
          `[GLOBAL_POOL] Task ${task.id.substring(0, 8)}... aborted`
        );
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
      this.removeTaskFromQueue(task.id);

      // Update run progress
      if (handle) {
        handle.completedCount++;

        // Check if run is complete
        if (handle.completedCount >= handle.totalCount) {
          console.log(
            `[GLOBAL_POOL] Run ${task.runId.substring(0, 8)}... completed (${handle.totalCount} tasks)`
          );
          this.runs.delete(task.runId);
          handle.resolve();
        }
      }
    }
  }

  /**
   * Remove a task from the queue.
   */
  private removeTaskFromQueue(taskId: string): void {
    this.taskQueue.remove(taskId);
  }
}

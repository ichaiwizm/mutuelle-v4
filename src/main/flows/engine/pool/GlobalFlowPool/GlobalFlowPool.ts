import type { FlowTask } from "../types";
import type { GlobalPoolConfig, GlobalTask, TaskCallbacks, RunHandle } from "../types/global";
import { BrowserManager } from "../BrowserManager";
import { TaskQueue } from "../TaskQueue";
import { TaskExecutor } from "./TaskExecutor";
import { QueueProcessor } from "./QueueProcessor";

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
  private runs: Map<string, RunHandle> = new Map();
  private browserManager: BrowserManager;
  private taskExecutor: TaskExecutor;
  private queueProcessor: QueueProcessor;
  private maxConcurrent: number;
  private config: GlobalPoolConfig;

  private constructor(config: GlobalPoolConfig = {}) {
    this.config = config;
    this.maxConcurrent = config.maxConcurrent ?? DEFAULT_MAX_CONCURRENT;
    this.browserManager = new BrowserManager(config.browserOptions);
    this.taskExecutor = new TaskExecutor(this.browserManager);
    this.queueProcessor = new QueueProcessor(
      this.taskQueue,
      this.browserManager,
      this.taskExecutor,
      this.maxConcurrent,
      this.runs
    );
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
      `[GLOBAL_POOL] Enqueued ${tasks.length} tasks for run ${runId.substring(0, 8)}... | Queue: ${this.taskQueue.length} | Active: ${this.taskExecutor.activeCount}`
    );

    // Start processing if not already running
    this.queueProcessor.start();

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

    console.log(`[GLOBAL_POOL] Removed ${removedCount} pending tasks from queue`);

    // Abort running workers for this run
    await this.taskExecutor.abortWorkersForRun(handle.taskIds);

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
    return this.taskExecutor.activeCount;
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
    this.taskExecutor.clear();
    this.runs.clear();
    this.queueProcessor.stop();
  }
}

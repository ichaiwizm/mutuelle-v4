import type { RunHandle } from "../types/global";
import type { BrowserManager } from "../BrowserManager";
import type { TaskQueue } from "../TaskQueue";
import type { TaskExecutor } from "./TaskExecutor";
import type { QueueProcessor } from "./QueueProcessor";

/**
 * Manages shutdown and cancellation operations for the GlobalFlowPool.
 * Handles run cancellation and graceful pool shutdown.
 */
export class ShutdownManager {
  constructor(
    private runs: Map<string, RunHandle>,
    private taskQueue: TaskQueue,
    private taskExecutor: TaskExecutor,
    private browserManager: BrowserManager,
    private queueProcessor: QueueProcessor
  ) {}

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

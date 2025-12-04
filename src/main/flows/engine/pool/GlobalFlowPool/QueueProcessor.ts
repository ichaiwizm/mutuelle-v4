import type { GlobalTask, RunHandle } from "../types/global";
import { BrowserManager } from "../BrowserManager";
import { TaskQueue } from "../TaskQueue";
import { TaskExecutor } from "./TaskExecutor";

export class QueueProcessor {
  private taskQueue: TaskQueue;
  private browserManager: BrowserManager;
  private taskExecutor: TaskExecutor;
  private maxConcurrent: number;
  private isProcessing = false;
  private runs: Map<string, RunHandle>;

  constructor(
    taskQueue: TaskQueue,
    browserManager: BrowserManager,
    taskExecutor: TaskExecutor,
    maxConcurrent: number,
    runs: Map<string, RunHandle>
  ) {
    this.taskQueue = taskQueue;
    this.browserManager = browserManager;
    this.taskExecutor = taskExecutor;
    this.maxConcurrent = maxConcurrent;
    this.runs = runs;
  }

  get processing(): boolean {
    return this.isProcessing;
  }

  /**
   * Start processing the queue if not already running.
   */
  start(): void {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.processQueue().catch((error) => {
      console.error("[GLOBAL_POOL] Processing error:", error);
      this.isProcessing = false;
    });
  }

  /**
   * Stop processing.
   */
  stop(): void {
    this.isProcessing = false;
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
        this.taskExecutor.activeCount < this.maxConcurrent &&
        this.hasQueuedTasks()
      ) {
        const task = this.getNextTask();
        if (!task) break;

        const handle = this.runs.get(task.runId);

        // Don't await - run concurrently
        this.taskExecutor.execute(
          task,
          handle,
          () => this.onTaskComplete(task, handle),
          (taskId) => this.taskQueue.remove(taskId)
        );
      }

      // Wait a bit before checking again if we're at capacity
      if (this.hasWork()) {
        await this.waitForWorkerSlot();
      }
    }

    // All done - close browser if no more work
    // BUT keep browser open if there are workers waiting for user (manual takeover)
    const hasWaitingUserWorkers = this.taskExecutor.waitingUserCount > 0;
    if (this.taskQueue.isEmpty && this.runs.size === 0 && !hasWaitingUserWorkers) {
      console.log(`[GLOBAL_POOL] No more work and no waiting_user workers - closing browser`);
      await this.browserManager.close();
    } else if (hasWaitingUserWorkers) {
      console.log(`[GLOBAL_POOL] Processing done but ${this.taskExecutor.waitingUserCount} worker(s) waiting for user - keeping browser open`);
    }

    this.isProcessing = false;
  }

  /**
   * Handle task completion and run progress tracking.
   */
  private onTaskComplete(task: GlobalTask, handle: RunHandle | undefined): void {
    if (handle) {
      handle.completedCount++;

      // Check if run is complete
      if (handle.completedCount >= handle.totalCount) {
        this.runs.delete(task.runId);
        handle.resolve();
      }
    }
  }

  /**
   * Check if there's work to do.
   */
  private hasWork(): boolean {
    return this.hasQueuedTasks() || this.taskExecutor.activeCount > 0;
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
        const activeCount = this.taskExecutor.activeCount;
        const hasQueued = this.hasQueuedTasks();

        // Si on peut traiter des tâches en queue, continuer
        if (activeCount < this.maxConcurrent && hasQueued) {
          resolve();
          return;
        }

        // Si plus de tâches en queue, sortir avec un délai pour éviter busy loop
        if (!hasQueued) {
          setTimeout(resolve, 100);
          return;
        }

        // Attendre et réessayer (on est à capacité max avec des tâches en queue)
        setTimeout(check, 50);
      };
      check();
    });
  }
}

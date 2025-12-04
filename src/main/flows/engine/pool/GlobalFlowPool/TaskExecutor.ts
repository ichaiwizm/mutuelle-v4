import type { BrowserContext } from "playwright";
import type { GlobalTask, RunHandle } from "../types/global";
import { BrowserManager } from "../BrowserManager";
import { FlowWorker } from "../FlowWorker";

// Track waiting_user workers with their contexts (for later cleanup)
type WaitingWorkerEntry = {
  worker: FlowWorker;
  context: BrowserContext;
  task: GlobalTask;
};

export class TaskExecutor {
  private activeWorkers: Map<string, FlowWorker> = new Map();
  private pendingTasks: Set<string> = new Set();
  private browserManager: BrowserManager;

  // Workers in waiting_user state (not cleaned up yet)
  private waitingUserWorkers: Map<string, WaitingWorkerEntry> = new Map();

  constructor(browserManager: BrowserManager) {
    this.browserManager = browserManager;
  }

  get activeCount(): number {
    return this.activeWorkers.size + this.pendingTasks.size;
  }

  get waitingUserCount(): number {
    return this.waitingUserWorkers.size;
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
    const taskShortId = task.id.substring(0, 8);
    console.log(`\n[TASK_EXECUTOR] ========== EXECUTE START ==========`);
    console.log(`[TASK_EXECUTOR] Task ID: ${taskShortId}...`);
    console.log(`[TASK_EXECUTOR] Flow: ${task.flowKey}`);
    console.log(`[TASK_EXECUTOR] Run ID: ${task.runId.substring(0, 8)}...`);
    console.log(`[TASK_EXECUTOR] Active workers: ${this.activeWorkers.size}`);
    console.log(`[TASK_EXECUTOR] Pending tasks: ${this.pendingTasks.size}`);

    // Reserve slot immediately to prevent race condition
    console.log(`[TASK_EXECUTOR] Adding task to pendingTasks set...`);
    this.pendingTasks.add(task.id);
    console.log(`[TASK_EXECUTOR] Pending tasks after add: ${this.pendingTasks.size}`);

    // Check if run was cancelled
    console.log(`[TASK_EXECUTOR] Checking if run was cancelled...`);
    console.log(`[TASK_EXECUTOR] Handle exists: ${!!handle}`);
    console.log(`[TASK_EXECUTOR] Signal aborted: ${handle?.abortController.signal.aborted}`);

    if (!handle || handle.abortController.signal.aborted) {
      console.log(`[TASK_EXECUTOR] Run was cancelled, aborting task`);
      this.pendingTasks.delete(task.id);
      task.status = "cancelled";
      removeTaskFromQueue(task.id);
      return;
    }

    console.log(
      `[GLOBAL_POOL] Starting task ${taskShortId}... (${task.flowKey}) | Run: ${task.runId.substring(0, 8)}...`
    );

    // Determine if we need visible mode
    const isVisibleMode = task.automationSettings?.headless === false;
    console.log(`[TASK_EXECUTOR] Creating browser context for task ${taskShortId}...`);
    console.log(`[TASK_EXECUTOR] Visible mode: ${isVisibleMode}`);
    console.log(`[TASK_EXECUTOR] Calling browserManager.createContext()...`);
    const contextStart = Date.now();

    let context: BrowserContext;
    try {
      context = await this.browserManager.createContext({ visible: isVisibleMode });
      console.log(`[TASK_EXECUTOR] Browser context created in ${Date.now() - contextStart}ms`);
    } catch (error) {
      console.error(`[TASK_EXECUTOR] FAILED to create browser context:`, error);
      this.pendingTasks.delete(task.id);
      task.status = "failed";
      const err = error instanceof Error ? error : new Error(String(error));
      await task.callbacks.onError(task.id, err);
      removeTaskFromQueue(task.id);
      onTaskComplete();
      return;
    }

    console.log(`[TASK_EXECUTOR] Creating FlowWorker instance...`);
    const worker = new FlowWorker(task.id, context);
    console.log(`[TASK_EXECUTOR] FlowWorker created`);

    // Set up manual close callback for visible mode
    if (isVisibleMode && task.callbacks.onManualComplete) {
      worker.setOnManualClose(async (taskId: string) => {
        console.log(`[TASK_EXECUTOR] Manual close callback for task ${taskId.substring(0, 8)}...`);

        // Get the entry and clean up
        const entry = this.waitingUserWorkers.get(taskId);
        if (entry) {
          this.waitingUserWorkers.delete(taskId);

          // Close the context
          try {
            await this.browserManager.closeContext(entry.context);
          } catch {
            // Ignore errors - context may already be closed
          }

          // Notify callback
          await task.callbacks.onManualComplete!(taskId);
        }
      });
    }

    // Transfer from pending to active
    console.log(`[TASK_EXECUTOR] Transferring task from pending to active...`);
    this.pendingTasks.delete(task.id);
    this.activeWorkers.set(task.id, worker);
    console.log(`[TASK_EXECUTOR] Active workers: ${this.activeWorkers.size} | Pending: ${this.pendingTasks.size}`);

    // Flag to skip cleanup in finally block when entering waiting_user state
    let skipFinallyCleanup = false;

    try {
      // Notify start
      console.log(`[TASK_EXECUTOR] Calling task.callbacks.onStart()...`);
      const onStartStart = Date.now();
      await task.callbacks.onStart(task.id);
      console.log(`[TASK_EXECUTOR] onStart callback completed in ${Date.now() - onStartStart}ms`);

      // Execute with run's abort signal
      console.log(`[TASK_EXECUTOR] Calling worker.execute()...`);
      const executeStart = Date.now();
      const result = await worker.execute(task, handle.abortController.signal);
      console.log(`[TASK_EXECUTOR] worker.execute() completed in ${Date.now() - executeStart}ms`);
      console.log(`[TASK_EXECUTOR] Result - success: ${result.success}, aborted: ${result.aborted}`);

      // Handle result
      if (result.aborted) {
        task.status = "cancelled";
        console.log(`[GLOBAL_POOL] Task ${taskShortId}... aborted`);
      } else if (result.waitingUser) {
        // Special case: waiting for manual user takeover
        // DON'T cleanup - keep worker and context alive
        console.log(`[TASK_EXECUTOR] Task entering waiting_user state`);
        task.status = "completed"; // Mark task as "done" from pool perspective

        // Store in waitingUserWorkers for later cleanup
        this.waitingUserWorkers.set(task.id, { worker, context, task });

        // Remove from active workers (it's no longer "actively running")
        this.activeWorkers.delete(task.id);
        removeTaskFromQueue(task.id);

        // Notify callback
        if (task.callbacks.onWaitingUser) {
          await task.callbacks.onWaitingUser(task.id, result);
        }

        console.log(
          `[GLOBAL_POOL] Task ${taskShortId}... waiting_user | Step: ${result.stoppedAtStep}`
        );

        // Signal task completion but DON'T cleanup in finally block
        skipFinallyCleanup = true;
        onTaskComplete();
        return;
      } else if (result.success) {
        task.status = "completed";
        console.log(`[TASK_EXECUTOR] Calling onComplete callback...`);
        await task.callbacks.onComplete(task.id, result);
        console.log(
          `[GLOBAL_POOL] Task ${taskShortId}... completed | Duration: ${result.totalDuration}ms`
        );
      } else {
        task.status = "failed";
        console.log(`[TASK_EXECUTOR] Calling onComplete callback (failed)...`);
        await task.callbacks.onComplete(task.id, result);
        console.log(
          `[GLOBAL_POOL] Task ${taskShortId}... failed: ${result.error?.message}`
        );
      }
    } catch (error) {
      console.error(`[TASK_EXECUTOR] EXCEPTION during task execution:`, error);
      task.status = "failed";
      const err = error instanceof Error ? error : new Error(String(error));
      await task.callbacks.onError(task.id, err);
      console.error(
        `[GLOBAL_POOL] Task ${taskShortId}... error:`,
        err.message
      );
    } finally {
      console.log(`[TASK_EXECUTOR] Entering finally block for task ${taskShortId}...`);

      // Skip cleanup if entering waiting_user state (browser should stay open)
      if (skipFinallyCleanup) {
        console.log(`[TASK_EXECUTOR] Skipping cleanup - task is in waiting_user state`);
        console.log(`[TASK_EXECUTOR] ========== EXECUTE END (waiting_user) ==========\n`);
        return;
      }

      // Cleanup
      console.log(`[TASK_EXECUTOR] Calling worker.cleanup()...`);
      await worker.cleanup();
      console.log(`[TASK_EXECUTOR] worker.cleanup() done`);

      console.log(`[TASK_EXECUTOR] Calling browserManager.closeContext()...`);
      await this.browserManager.closeContext(context);
      console.log(`[TASK_EXECUTOR] closeContext() done`);

      this.activeWorkers.delete(task.id);
      removeTaskFromQueue(task.id);
      console.log(`[TASK_EXECUTOR] Active workers after cleanup: ${this.activeWorkers.size}`);

      // Notify completion
      console.log(`[TASK_EXECUTOR] Calling onTaskComplete callback...`);
      onTaskComplete();
      console.log(`[TASK_EXECUTOR] ========== EXECUTE END ==========\n`);
    }
  }

  /**
   * Abort workers for a specific run.
   */
  async abortWorkersForRun(taskIds: Set<string>): Promise<void> {
    // Abort active workers
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

    // Also abort any waitingUser workers for this run
    const waitingWorkers = Array.from(this.waitingUserWorkers.entries()).filter(
      ([taskId]) => taskIds.has(taskId)
    );

    if (waitingWorkers.length > 0) {
      console.log(`[GLOBAL_POOL] Aborting ${waitingWorkers.length} waiting_user tasks`);
      await Promise.all(
        waitingWorkers.map(async ([taskId, entry]) => {
          try {
            await entry.worker.abort();
            await this.browserManager.closeContext(entry.context);
          } catch {
            /* ignore */
          }
          this.waitingUserWorkers.delete(taskId);
        })
      );
    }
  }

  /**
   * Clear all active workers and waiting_user workers.
   */
  clear(): void {
    this.activeWorkers.clear();
    this.pendingTasks.clear();
    this.waitingUserWorkers.clear();
  }

  /**
   * Clean up all waiting_user workers (used on shutdown).
   */
  async cleanupWaitingUserWorkers(): Promise<void> {
    console.log(`[TASK_EXECUTOR] Cleaning up ${this.waitingUserWorkers.size} waiting_user workers`);

    await Promise.all(
      Array.from(this.waitingUserWorkers.entries()).map(async ([taskId, entry]) => {
        try {
          await entry.worker.abort();
          await this.browserManager.closeContext(entry.context);
        } catch {
          /* ignore */
        }
      })
    );

    this.waitingUserWorkers.clear();
  }
}

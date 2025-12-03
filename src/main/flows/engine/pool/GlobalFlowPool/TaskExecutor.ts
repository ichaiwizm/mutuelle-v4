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

    console.log(`[TASK_EXECUTOR] Creating browser context for task ${taskShortId}...`);
    console.log(`[TASK_EXECUTOR] Calling browserManager.createContext()...`);
    const contextStart = Date.now();

    let context;
    try {
      context = await this.browserManager.createContext();
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

    // Transfer from pending to active
    console.log(`[TASK_EXECUTOR] Transferring task from pending to active...`);
    this.pendingTasks.delete(task.id);
    this.activeWorkers.set(task.id, worker);
    console.log(`[TASK_EXECUTOR] Active workers: ${this.activeWorkers.size} | Pending: ${this.pendingTasks.size}`);

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

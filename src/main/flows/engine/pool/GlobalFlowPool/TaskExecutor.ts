import type { GlobalTask, RunHandle } from "../types/global";
import type { BrowserManager } from "../browser";
import { TaskStateManager, WorkerLifecycleManager } from "../state";
import { captureException } from "../../../../services/monitoring";

/**
 * TaskExecutor - Orchestrates task execution.
 * Uses TaskStateManager for state tracking and WorkerLifecycleManager for worker lifecycle.
 */
export class TaskExecutor {
  private stateManager: TaskStateManager;
  private lifecycleManager: WorkerLifecycleManager;

  constructor(browserManager: BrowserManager) {
    this.stateManager = new TaskStateManager();
    this.lifecycleManager = new WorkerLifecycleManager(browserManager);
  }

  get activeCount(): number {
    return this.stateManager.activeCount;
  }

  get waitingUserCount(): number {
    return this.stateManager.waitingUserCount;
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

    // Reserve slot immediately to prevent race condition
    this.stateManager.addPending(task.id);

    // Check if run was cancelled
    if (!handle || handle.abortController.signal.aborted) {
      console.log(`[TASK_EXECUTOR] Run was cancelled, aborting task`);
      this.stateManager.removePending(task.id);
      task.status = "cancelled";
      removeTaskFromQueue(task.id);
      return;
    }

    const isVisibleMode = task.automationSettings?.headless === false;

    // Create worker with context
    let worker, context;
    try {
      const result = await this.lifecycleManager.createWorkerWithContext(task.id, isVisibleMode);
      worker = result.worker;
      context = result.context;
    } catch (error) {
      console.error(`[TASK_EXECUTOR] FAILED to create browser context:`, error);
      const err = error instanceof Error ? error : new Error(String(error));
      captureException(err, {
        tags: { flowKey: task.flowKey, context: "browser-context-creation" },
        extra: { taskId: task.id },
      });
      this.stateManager.removePending(task.id);
      task.status = "failed";
      await task.callbacks.onError(task.id, err);
      removeTaskFromQueue(task.id);
      onTaskComplete();
      return;
    }

    // Set up manual close callback for visible mode
    if (isVisibleMode && task.callbacks.onManualComplete) {
      worker.setOnManualClose(async (taskId: string) => {
        console.log(`[TASK_EXECUTOR] Manual close callback for task ${taskId.substring(0, 8)}...`);
        const entry = this.stateManager.removeWaitingUser(taskId);
        if (entry) {
          await this.lifecycleManager.closeContext(entry.context);
          await task.callbacks.onManualComplete!(taskId);
        }
      });
    }

    // Transfer from pending to active
    this.stateManager.movePendingToActive(task.id, worker);

    let skipFinallyCleanup = false;

    try {
      await task.callbacks.onStart(task.id);
      const result = await worker.execute(task, handle.abortController.signal);

      if (result.aborted) {
        task.status = "cancelled";
        console.log(`[GLOBAL_POOL] Task ${taskShortId}... aborted`);
      } else if (result.waitingUser) {
        // Handle waiting_user state
        console.log(`[TASK_EXECUTOR] Task entering waiting_user state`);
        task.status = "completed";

        this.stateManager.removeActive(task.id);
        this.stateManager.addWaitingUser(task.id, { worker, context, task });
        removeTaskFromQueue(task.id);

        if (task.callbacks.onWaitingUser) {
          await task.callbacks.onWaitingUser(task.id, result);
        }

        console.log(`[GLOBAL_POOL] Task ${taskShortId}... waiting_user | Step: ${result.stoppedAtStep}`);
        skipFinallyCleanup = true;
        onTaskComplete();
        return;
      } else if (result.success) {
        task.status = "completed";
        await task.callbacks.onComplete(task.id, result);
        console.log(`[GLOBAL_POOL] Task ${taskShortId}... completed | Duration: ${result.totalDuration}ms`);
      } else {
        task.status = "failed";
        await task.callbacks.onComplete(task.id, result);
        console.log(`[GLOBAL_POOL] Task ${taskShortId}... failed: ${result.error?.message}`);
      }
    } catch (error) {
      console.error(`[TASK_EXECUTOR] EXCEPTION during task execution:`, error);
      const err = error instanceof Error ? error : new Error(String(error));
      captureException(err, {
        tags: { flowKey: task.flowKey, context: "task-execution" },
        extra: { taskId: task.id },
      });
      task.status = "failed";
      await task.callbacks.onError(task.id, err);
    } finally {
      if (skipFinallyCleanup) {
        console.log(`[TASK_EXECUTOR] Skipping cleanup - task is in waiting_user state`);
        console.log(`[TASK_EXECUTOR] ========== EXECUTE END (waiting_user) ==========\n`);
        return;
      }

      await this.lifecycleManager.cleanupWorker(worker, context);
      this.stateManager.removeActive(task.id);
      removeTaskFromQueue(task.id);
      onTaskComplete();
      console.log(`[TASK_EXECUTOR] ========== EXECUTE END ==========\n`);
    }
  }

  /**
   * Abort workers for a specific run.
   */
  async abortWorkersForRun(taskIds: Set<string>): Promise<void> {
    // Abort active workers
    const runningWorkers = this.stateManager.getActiveWorkersForRun(taskIds);
    if (runningWorkers.length > 0) {
      console.log(`[GLOBAL_POOL] Aborting ${runningWorkers.length} running tasks`);
      await Promise.all(
        runningWorkers.map(([, worker]) => worker.abort().catch(() => {}))
      );
    }

    // Abort waiting_user workers
    const waitingWorkers = this.stateManager.getWaitingWorkersForRun(taskIds);
    if (waitingWorkers.length > 0) {
      console.log(`[GLOBAL_POOL] Aborting ${waitingWorkers.length} waiting_user tasks`);
      await this.lifecycleManager.abortWaitingWorkers(waitingWorkers);
      waitingWorkers.forEach(([taskId]) => this.stateManager.removeWaitingUser(taskId));
    }
  }

  /** Clear all state */
  clear(): void {
    this.stateManager.clear();
  }

  /** Clean up all waiting_user workers (used on shutdown) */
  async cleanupWaitingUserWorkers(): Promise<void> {
    const entries = this.stateManager.getAllWaitingUserEntries();
    console.log(`[TASK_EXECUTOR] Cleaning up ${entries.length} waiting_user workers`);
    await this.lifecycleManager.abortWaitingWorkers(entries);
    this.stateManager.clearWaitingUserWorkers();
  }
}

import type { GlobalTask, RunHandle } from "../types/global";
import type { BrowserManager } from "../browser";
import { TaskStateManager, WorkerLifecycleManager } from "../state";
import { TaskStateMachine, type TaskExecutionContext } from "./TaskStateMachine";
import { captureException } from "../../../../services/monitoring";
import { createWorkerForTask, abortWorkersForRun, cleanupAllWaitingWorkers } from "./TaskExecutorHelpers";

export class TaskExecutor {
  private stateManager: TaskStateManager;
  private lifecycleManager: WorkerLifecycleManager;
  private stateMachine: TaskStateMachine;

  constructor(browserManager: BrowserManager) {
    this.stateManager = new TaskStateManager();
    this.lifecycleManager = new WorkerLifecycleManager(browserManager);
    this.stateMachine = new TaskStateMachine(this.stateManager, this.lifecycleManager);
  }

  get activeCount(): number { return this.stateManager.activeCount; }
  get waitingUserCount(): number { return this.stateManager.waitingUserCount; }

  async execute(
    task: GlobalTask,
    handle: RunHandle | undefined,
    onTaskComplete: () => void,
    removeTaskFromQueue: (taskId: string) => void
  ): Promise<void> {
    const taskShortId = task.id.substring(0, 8);
    console.log(`\n[TASK_EXECUTOR] ========== EXECUTE START ==========`);
    console.log(`[TASK_EXECUTOR] Task ID: ${taskShortId}... | Flow: ${task.flowKey}`);
    this.stateMachine.reserveSlot(task.id);
    if (!handle || handle.abortController.signal.aborted) {
      console.log(`[TASK_EXECUTOR] Run was cancelled, aborting task`);
      this.stateMachine.releasePendingSlot(task.id);
      task.status = "cancelled";
      removeTaskFromQueue(task.id);
      return;
    }
    const workerResult = await createWorkerForTask(task, this.lifecycleManager, this.stateManager, removeTaskFromQueue, onTaskComplete);
    if (!workerResult) return;
    const { worker, context } = workerResult;
    if (task.automationSettings?.headless === false) {
      this.stateMachine.setupManualCloseCallback(task, worker, context);
    }
    this.stateMachine.activateTask(task.id, worker);
    const ctx: TaskExecutionContext = { task, handle, worker, context, removeTaskFromQueue, onTaskComplete };
    await this.runTask(ctx);
  }

  private async runTask(ctx: TaskExecutionContext): Promise<void> {
    const { task, handle, worker } = ctx;
    let skipFinallyCleanup = false;
    try {
      await task.callbacks.onStart(task.id);
      const result = await worker.execute(task, handle!.abortController.signal);
      if (result.aborted) {
        this.stateMachine.transitionToAborted(ctx);
      } else if (result.waitingUser) {
        await this.stateMachine.transitionToWaitingUser(ctx, result);
        skipFinallyCleanup = true;
        return;
      } else if (result.success) {
        await this.stateMachine.transitionToCompleted(ctx, result);
      } else {
        await this.stateMachine.transitionToFailed(ctx, result);
      }
    } catch (error) {
      console.error(`[TASK_EXECUTOR] EXCEPTION during task execution:`, error);
      const err = error instanceof Error ? error : new Error(String(error));
      captureException(err, { tags: { flowKey: task.flowKey, context: "task-execution" }, extra: { taskId: task.id } });
      task.status = "failed";
      await task.callbacks.onError(task.id, err);
    } finally {
      if (!skipFinallyCleanup) {
        await this.stateMachine.cleanup(ctx);
        console.log(`[TASK_EXECUTOR] ========== EXECUTE END ==========\n`);
      } else {
        console.log(`[TASK_EXECUTOR] ========== EXECUTE END (waiting_user) ==========\n`);
      }
    }
  }

  async abortWorkersForRun(taskIds: Set<string>): Promise<void> {
    return abortWorkersForRun(taskIds, this.stateManager, this.lifecycleManager);
  }

  clear(): void {
    this.stateManager.clear();
  }

  async cleanupWaitingUserWorkers(): Promise<void> {
    return cleanupAllWaitingWorkers(this.stateManager, this.lifecycleManager);
  }
}

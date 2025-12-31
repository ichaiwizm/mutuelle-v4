import type { GlobalTask, RunHandle } from "../types/global";
import type { FlowWorker } from "../workers";
import type { BrowserContext } from "playwright";
import type { TaskStateManager, WaitingWorkerEntry } from "../state";
import type { WorkerLifecycleManager } from "../state";
import type { FlowExecutionResult } from "../../types";

export type TaskExecutionContext = {
  task: GlobalTask;
  handle: RunHandle | undefined;
  worker: FlowWorker;
  context: BrowserContext;
  removeTaskFromQueue: (taskId: string) => void;
  onTaskComplete: () => void;
};

export class TaskStateMachine {
  constructor(private stateManager: TaskStateManager, private lifecycleManager: WorkerLifecycleManager) {}

  reserveSlot(taskId: string): void { this.stateManager.addPending(taskId); }
  releasePendingSlot(taskId: string): void { this.stateManager.removePending(taskId); }
  activateTask(taskId: string, worker: FlowWorker): void { this.stateManager.movePendingToActive(taskId, worker); }

  async transitionToWaitingUser(ctx: TaskExecutionContext, result: FlowExecutionResult): Promise<void> {
    const { task, worker, context, removeTaskFromQueue, onTaskComplete } = ctx;
    task.status = "completed";
    this.stateManager.removeActive(task.id);
    this.stateManager.addWaitingUser(task.id, { worker, context, task });
    removeTaskFromQueue(task.id);
    if (task.callbacks.onWaitingUser) await task.callbacks.onWaitingUser(task.id, result);
    onTaskComplete();
  }

  async transitionToCompleted(ctx: TaskExecutionContext, result: FlowExecutionResult): Promise<void> {
    ctx.task.status = "completed";
    await ctx.task.callbacks.onComplete(ctx.task.id, result);
  }

  async transitionToFailed(ctx: TaskExecutionContext, result: FlowExecutionResult): Promise<void> {
    ctx.task.status = "failed";
    await ctx.task.callbacks.onComplete(ctx.task.id, result);
  }

  transitionToAborted(ctx: TaskExecutionContext): void { ctx.task.status = "cancelled"; }

  async cleanup(ctx: TaskExecutionContext): Promise<void> {
    const { task, worker, context, removeTaskFromQueue, onTaskComplete } = ctx;
    await this.lifecycleManager.cleanupWorker(worker, context);
    this.stateManager.removeActive(task.id);
    removeTaskFromQueue(task.id);
    onTaskComplete();
  }

  setupManualCloseCallback(task: GlobalTask, worker: FlowWorker, context: BrowserContext): void {
    if (task.callbacks.onManualComplete) {
      worker.setOnManualClose(async (taskId: string) => {
        const entry = this.stateManager.removeWaitingUser(taskId);
        if (entry) {
          await this.lifecycleManager.closeContext(entry.context);
          await task.callbacks.onManualComplete!(taskId);
        }
      });
    }
  }
}

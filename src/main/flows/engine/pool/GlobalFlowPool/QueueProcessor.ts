import type { GlobalTask, RunHandle } from "../types/global";
import { BrowserManager } from "../browser";
import { TaskQueue } from "../TaskQueue";
import { TaskExecutor } from "./TaskExecutor";
import { BaseQueueProcessor } from "../BaseQueueProcessor";

export class QueueProcessor extends BaseQueueProcessor {
  private taskQueue: TaskQueue;
  private browserManager: BrowserManager;
  private taskExecutor: TaskExecutor;
  private runs: Map<string, RunHandle>;

  constructor(
    taskQueue: TaskQueue,
    browserManager: BrowserManager,
    taskExecutor: TaskExecutor,
    maxConcurrent: number,
    runs: Map<string, RunHandle>
  ) {
    super(maxConcurrent);
    this.taskQueue = taskQueue;
    this.browserManager = browserManager;
    this.taskExecutor = taskExecutor;
    this.runs = runs;
  }

  protected getRunningCount(): number { return this.taskExecutor.activeCount; }
  protected hasQueuedTasks(): boolean { return this.taskQueue.hasQueuedTasks(); }

  start(): void {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.processQueue().catch((e) => { console.error("[GLOBAL_POOL] Processing error:", e); this.isProcessing = false; });
  }

  stop(): void { this.isProcessing = false; }

  private async processQueue(): Promise<void> {
    if (!this.browserManager.isRunning()) await this.browserManager.launch();

    while (this.hasWork()) {
      while (this.canStartMore()) {
        const task = this.taskQueue.getNext();
        if (!task) break;
        const handle = this.runs.get(task.runId);
        this.taskExecutor.execute(task, handle, () => this.onTaskComplete(task, handle), (id) => this.taskQueue.remove(id));
      }
      if (this.hasWork()) await this.waitForWorkerSlot();
    }

    const hasWaiting = this.taskExecutor.waitingUserCount > 0;
    if (this.taskQueue.isEmpty && this.runs.size === 0 && !hasWaiting) {
      await this.browserManager.close();
    }
    this.isProcessing = false;
  }

  private onTaskComplete(task: GlobalTask, handle: RunHandle | undefined): void {
    if (handle) {
      handle.completedCount++;
      if (handle.completedCount >= handle.totalCount) {
        this.runs.delete(task.runId);
        handle.resolve();
      }
    }
  }
}

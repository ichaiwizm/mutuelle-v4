import type { FlowTask } from "../types";
import type { GlobalPoolConfig, TaskCallbacks, RunHandle } from "../types/global";
import { BrowserManager } from "../BrowserManager";
import { TaskQueue } from "../TaskQueue";
import { TaskExecutor } from "./TaskExecutor";
import { QueueProcessor } from "./QueueProcessor";
import { RunHandleFactory } from "./RunHandleFactory";
import { ShutdownManager } from "./ShutdownManager";

const DEFAULT_MAX_CONCURRENT = 5;

/**
 * Singleton pool that manages flow execution across ALL runs.
 * Enforces a global concurrency limit with priority-based FIFO queue.
 */
export class GlobalFlowPool {
  private static instance: GlobalFlowPool | null = null;
  private taskQueue: TaskQueue = new TaskQueue();
  private runs: Map<string, RunHandle> = new Map();
  private browserManager: BrowserManager;
  private taskExecutor: TaskExecutor;
  private queueProcessor: QueueProcessor;
  private runHandleFactory: RunHandleFactory;
  private shutdownManager: ShutdownManager;

  private constructor(config: GlobalPoolConfig = {}) {
    const maxConcurrent = config.maxConcurrent ?? DEFAULT_MAX_CONCURRENT;
    this.browserManager = new BrowserManager(config.browserOptions);
    this.taskExecutor = new TaskExecutor(this.browserManager);
    this.queueProcessor = new QueueProcessor(
      this.taskQueue, this.browserManager, this.taskExecutor, maxConcurrent, this.runs
    );
    this.runHandleFactory = new RunHandleFactory();
    this.shutdownManager = new ShutdownManager(
      this.runs, this.taskQueue, this.taskExecutor, this.browserManager, this.queueProcessor
    );
  }

  static getInstance(config?: GlobalPoolConfig): GlobalFlowPool {
    if (!GlobalFlowPool.instance) {
      GlobalFlowPool.instance = new GlobalFlowPool(config);
    }
    return GlobalFlowPool.instance;
  }

  static async resetInstance(): Promise<void> {
    if (GlobalFlowPool.instance) {
      await GlobalFlowPool.instance.shutdown();
      GlobalFlowPool.instance = null;
    }
  }

  /** Enqueue tasks for a run. Returns a promise that resolves when all tasks complete. */
  async enqueueRun(runId: string, tasks: FlowTask[], callbacks: TaskCallbacks): Promise<void> {
    console.log(`[GLOBAL_POOL] Enqueue run ${runId.substring(0, 8)}... (${tasks.length} tasks)`);
    if (tasks.length === 0) return;

    const handle = this.runHandleFactory.createRunHandle(runId, tasks);
    this.runs.set(runId, handle);

    const globalTasks = this.runHandleFactory.createGlobalTasks(tasks, runId, callbacks);
    this.taskQueue.add(globalTasks);

    console.log(`[GLOBAL_POOL] Queue: ${this.taskQueue.length} | Active: ${this.taskExecutor.activeCount}`);
    this.queueProcessor.start();
    return handle.completionPromise;
  }

  async cancelRun(runId: string): Promise<void> {
    return this.shutdownManager.cancelRun(runId);
  }

  get queueLength(): number { return this.taskQueue.queuedCount; }
  get activeCount(): number { return this.taskExecutor.activeCount; }
  get activeRunCount(): number { return this.runs.size; }

  async shutdown(): Promise<void> {
    return this.shutdownManager.shutdown();
  }
}

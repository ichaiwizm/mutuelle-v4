import { EventEmitter } from "events";
import type { FlowTask, FlowPoolConfig, FlowPoolResult, QueuedTask } from "./types";
import type { FlowExecutionResult } from "../types";
import { BrowserManager } from "./BrowserManager";
import { FlowWorker } from "./FlowWorker";
import { QueueProcessor } from "./QueueProcessor";

const DEFAULT_MAX_CONCURRENT = 3;

/**
 * Manages parallel execution of multiple flows.
 *
 * @example
 * ```typescript
 * const pool = new FlowPool({ maxConcurrent: 3 });
 * pool.on('task:complete', (taskId, result) => console.log(taskId, result.success));
 * pool.enqueue([{ id: '1', flowKey: 'alptis', leadId: 'l1', lead }]);
 * const result = await pool.start();
 * ```
 */
export class FlowPool extends EventEmitter {
  private queue: QueuedTask[] = [];
  private activeWorkers: Map<string, FlowWorker> = new Map();
  private maxConcurrent: number;
  private browserManager: BrowserManager;
  private config: FlowPoolConfig;
  private processor: QueueProcessor;
  private isRunning = false;

  constructor(config?: FlowPoolConfig) {
    super();
    this.config = config ?? {};
    this.maxConcurrent = config?.maxConcurrent ?? DEFAULT_MAX_CONCURRENT;
    this.browserManager = new BrowserManager(config?.browserOptions);
    this.processor = new QueueProcessor(
      {
        browserManager: this.browserManager,
        config: this.config,
        emitter: this,
        activeWorkers: this.activeWorkers,
      },
      this.maxConcurrent
    );
  }

  /** Add tasks to the execution queue. Sorted by priority (higher first). */
  enqueue(tasks: FlowTask[]): void {
    const queuedTasks: QueuedTask[] = tasks.map((task) => ({
      ...task,
      queuedAt: Date.now(),
      status: "queued" as const,
    }));

    this.queue.push(...queuedTasks);
    this.queue.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    for (const task of queuedTasks) {
      this.emit("task:queued", task.id);
    }
  }

  /** Start processing the queue. Returns when all tasks are completed. */
  async start(): Promise<FlowPoolResult> {
    if (this.isRunning) throw new Error("Pool is already running");
    if (this.queue.length === 0) return this.emptyResult();

    this.isRunning = true;
    this.processor.resume();
    const startTime = Date.now();
    const results = new Map<string, FlowExecutionResult>();

    try {
      await this.browserManager.launch();
      this.emit("pool:start");

      await this.processor.process(this.queue, results);

      const poolResult = this.buildResult(results, startTime);
      this.emit("pool:complete", poolResult);
      return poolResult;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit("pool:error", err);
      throw err;
    } finally {
      await this.browserManager.close();
      this.isRunning = false;
      this.queue = [];
    }
  }

  /** Request pause for all active workers. */
  pauseAll(): void {
    this.processor.pause();
    for (const worker of this.activeWorkers.values()) {
      worker.requestPause();
    }
  }

  /** Resume processing after a pause. */
  resume(): void {
    this.processor.resume();
  }

  /** Shutdown the pool and cleanup resources. */
  async shutdown(): Promise<void> {
    this.processor.pause();
    for (const worker of this.activeWorkers.values()) {
      worker.requestPause();
      await worker.cleanup();
    }
    this.activeWorkers.clear();
    await this.browserManager.close();
    this.isRunning = false;
    this.queue = [];
  }

  get queueLength(): number {
    return this.queue.filter((t) => t.status === "queued").length;
  }

  get activeCount(): number {
    return this.activeWorkers.size;
  }

  private emptyResult(): FlowPoolResult {
    return { total: 0, successful: 0, failed: 0, duration: 0, results: new Map() };
  }

  private buildResult(results: Map<string, FlowExecutionResult>, startTime: number): FlowPoolResult {
    let successful = 0;
    let failed = 0;
    for (const r of results.values()) {
      r.success ? successful++ : failed++;
    }
    return { total: results.size, successful, failed, duration: Date.now() - startTime, results };
  }
}

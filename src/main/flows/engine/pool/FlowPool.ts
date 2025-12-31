import { EventEmitter } from "events";
import type { FlowTask, FlowPoolConfig, FlowPoolResult, QueuedTask } from "./types";
import type { FlowExecutionResult } from "../types";
import { BrowserManager } from "./BrowserManager";
import { FlowWorker } from "./FlowWorker";
import { QueueProcessor } from "./QueueProcessor";

/** Manages parallel execution of multiple flows using YamlFlowEngine via FlowWorker */
export class FlowPool extends EventEmitter {
  private queue: QueuedTask[] = [];
  private activeWorkers = new Map<string, FlowWorker>();
  private browserManager: BrowserManager;
  private processor: QueueProcessor;
  private isRunning = false;
  private abortController: AbortController | null = null;

  constructor(config: FlowPoolConfig = {}) {
    super();
    this.browserManager = new BrowserManager(config.browserOptions);
    this.processor = new QueueProcessor(
      { browserManager: this.browserManager, config, emitter: this, activeWorkers: this.activeWorkers },
      config.maxConcurrent ?? 3
    );
  }

  enqueue(tasks: FlowTask[]): void {
    const queued: QueuedTask[] = tasks.map(t => ({ ...t, queuedAt: Date.now(), status: "queued" as const }));
    this.queue.push(...queued);
    this.queue.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    queued.forEach(t => this.emit("task:queued", t.id));
  }

  async start(): Promise<FlowPoolResult> {
    if (this.isRunning) throw new Error("Pool is already running");
    if (!this.queue.length) return { total: 0, successful: 0, failed: 0, duration: 0, results: new Map() };
    this.isRunning = true;
    this.abortController = new AbortController();
    this.processor.setAbortSignal(this.abortController.signal);
    this.processor.resume();
    const start = Date.now(), results = new Map<string, FlowExecutionResult>();
    try {
      await this.browserManager.launch();
      this.emit("pool:start");
      await this.processor.process(this.queue, results);
      const res = this.buildResult(results, start);
      this.emit("pool:complete", res);
      return res;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      this.emit("pool:error", err);
      throw err;
    } finally {
      await this.browserManager.close();
      this.isRunning = false;
      this.queue = [];
    }
  }

  pauseAll(): void { this.processor.pause(); this.activeWorkers.forEach(w => w.requestPause()); }
  resume(): void { this.processor.resume(); }

  async shutdown(): Promise<void> {
    this.processor.pause();
    await Promise.all([...this.activeWorkers.values()].map(async w => { w.requestPause(); await w.cleanup(); }));
    this.activeWorkers.clear();
    await this.browserManager.close();
    this.isRunning = false;
    this.queue = [];
  }

  async abort(): Promise<void> {
    this.abortController?.abort();
    await Promise.all([...this.activeWorkers.values()].map(w => w.abort().catch(() => {})));
    this.activeWorkers.clear();
    await this.browserManager.close();
    this.isRunning = false;
    this.queue = [];
    this.abortController = null;
  }

  get queueLength(): number { return this.queue.filter(t => t.status === "queued").length; }
  get activeCount(): number { return this.activeWorkers.size; }

  private buildResult(results: Map<string, FlowExecutionResult>, start: number): FlowPoolResult {
    let successful = 0, failed = 0;
    results.forEach(r => r.success ? successful++ : failed++);
    return { total: results.size, successful, failed, duration: Date.now() - start, results };
  }
}

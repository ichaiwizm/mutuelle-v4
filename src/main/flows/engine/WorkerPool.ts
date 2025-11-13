import type { Worker, QueueItem } from '../types/QueueTypes';
import type { ProductResult } from '../types/ProductTypes';

type WorkerTask = (item: QueueItem, workerId: number) => Promise<ProductResult>;

/**
 * Manages a pool of workers for parallel processing.
 */
export class WorkerPool {
  private workers: Worker[] = [];
  private queue: QueueItem[] = [];
  private results: Map<string, ProductResult> = new Map();
  private task?: WorkerTask;
  private retryConfig: { attempts: number; delay: number };

  constructor(maxWorkers: number, retryConfig: { attempts: number; delay: number }) {
    this.retryConfig = retryConfig;
    for (let i = 0; i < maxWorkers; i++) {
      this.workers.push({ id: i, busy: false });
    }
  }

  setTask(task: WorkerTask): void {
    this.task = task;
  }

  enqueue(items: QueueItem[]): void {
    this.queue.push(...items);
  }

  async processAll(): Promise<Map<string, ProductResult>> {
    const promises = this.workers.map((worker) => this.workerLoop(worker));
    await Promise.all(promises);
    return this.results;
  }

  private async workerLoop(worker: Worker): Promise<void> {
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      worker.busy = true;
      worker.currentItem = item;

      try {
        const result = await this.processWithRetry(item, worker.id);
        this.results.set(item.id, result);
      } catch (error) {
        console.error(`Worker ${worker.id} failed:`, error);
      } finally {
        worker.busy = false;
        worker.currentItem = undefined;
      }
    }
  }

  private async processWithRetry(
    item: QueueItem,
    workerId: number
  ): Promise<ProductResult> {
    if (!this.task) {
      throw new Error('No task handler set');
    }

    const maxRetries = item.maxRetries ?? this.retryConfig.attempts;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.task(item, workerId);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries) {
          await this.delay(this.retryConfig.delay * (attempt + 1));
        }
      }
    }

    throw lastError ?? new Error('Execution failed');
  }

  getWorkerStats() {
    return {
      total: this.workers.length,
      busy: this.workers.filter((w) => w.busy).length,
      idle: this.workers.filter((w) => !w.busy).length,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

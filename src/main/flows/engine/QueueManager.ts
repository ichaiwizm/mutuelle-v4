import type { QueueItem, QueueConfig, QueueStats } from '../types/QueueTypes';
import type { ProductResult } from '../types/ProductTypes';
import { BrowserPool } from './BrowserPool';
import { ProductRegistry } from '../registry/ProductRegistry';
import { WorkerPool } from './WorkerPool';

type QueueItemHandler = (item: QueueItem) => Promise<ProductResult>;

/**
 * Manages queue of flow executions with parallel workers.
 */
export class QueueManager {
  private config: QueueConfig;
  private browserPool: BrowserPool;
  private registry: ProductRegistry;
  private workerPool: WorkerPool;
  private handler?: QueueItemHandler;

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = {
      maxWorkers: config.maxWorkers ?? 3,
      retryAttempts: config.retryAttempts ?? 2,
      retryDelay: config.retryDelay ?? 2000,
      timeout: config.timeout ?? 300000,
    };

    this.browserPool = new BrowserPool({ timeout: this.config.timeout });
    this.registry = ProductRegistry.getInstance();
    this.workerPool = new WorkerPool(this.config.maxWorkers, {
      attempts: this.config.retryAttempts,
      delay: this.config.retryDelay,
    });
  }

  /**
   * Set custom handler for queue items
   */
  setHandler(handler: QueueItemHandler): void {
    this.handler = handler;
    this.workerPool.setTask(async (item, workerId) => {
      if (!this.handler) throw new Error('No handler set');
      return await this.handler(item);
    });
  }

  /**
   * Add items to queue
   */
  enqueue(items: QueueItem[]): void {
    this.workerPool.enqueue(items);
  }

  /**
   * Process all items in queue
   */
  async processAll(): Promise<Map<string, ProductResult>> {
    await this.browserPool.initialize();
    const results = await this.workerPool.processAll();
    await this.browserPool.close();
    return results;
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const workerStats = this.workerPool.getWorkerStats();
    return {
      total: 0, // Would need to track this separately
      pending: 0,
      running: workerStats.busy,
      completed: 0,
      failed: 0,
      workers: workerStats,
    };
  }
}

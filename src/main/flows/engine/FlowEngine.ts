import { QueueManager } from './QueueManager';
import { ItemExecutor } from './ItemExecutor';
import { RunLoader } from './RunLoader';

/**
 * Main flow engine - orchestrates execution of queued automation runs.
 * Entry point for the automation system.
 */
export class FlowEngine {
  private static instance: FlowEngine;
  private loader: RunLoader;
  private executor: ItemExecutor;

  private constructor() {
    this.loader = new RunLoader();
    this.executor = new ItemExecutor();
  }

  static getInstance(): FlowEngine {
    if (!FlowEngine.instance) {
      FlowEngine.instance = new FlowEngine();
    }
    return FlowEngine.instance;
  }

  /**
   * Process all queued runs
   */
  async runQueued(): Promise<void> {
    const queuedRuns = await this.loader.getQueuedRuns();

    for (const run of queuedRuns) {
      await this.executeRun(run.id);
    }
  }

  /**
   * Execute a specific run
   */
  private async executeRun(runId: string): Promise<void> {
    await this.loader.updateRunStatus(runId, 'running');

    try {
      const queueItems = await this.loader.buildQueueItems(runId);

      const queueManager = new QueueManager();
      queueManager.setHandler(async (item) => {
        return await this.executor.execute(item);
      });

      queueManager.enqueue(queueItems);
      await queueManager.processAll();

      await this.loader.updateRunStatus(runId, 'done');
    } catch (error) {
      console.error(`Run ${runId} failed:`, error);
      await this.loader.updateRunStatus(runId, 'failed');
    }
  }
}

export const Engine = FlowEngine.getInstance();

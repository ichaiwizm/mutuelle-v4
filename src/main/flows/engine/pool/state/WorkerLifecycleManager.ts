import type { BrowserContext } from "playwright";
import type { BrowserManager } from "../browser";
import { FlowWorker } from "../workers";
import type { WaitingWorkerEntry } from "./types";

/**
 * WorkerLifecycleManager - Manages worker creation and cleanup.
 * Creates workers with browser contexts and handles cleanup.
 */
export class WorkerLifecycleManager {
  constructor(private browserManager: BrowserManager) {}

  /**
   * Create a new worker with a browser context.
   */
  async createWorkerWithContext(
    taskId: string,
    isVisibleMode: boolean
  ): Promise<{ worker: FlowWorker; context: BrowserContext }> {
    const taskShortId = taskId.substring(0, 8);
    console.log(`[WORKER_LIFECYCLE] Creating browser context for task ${taskShortId}...`);
    console.log(`[WORKER_LIFECYCLE] Visible mode: ${isVisibleMode}`);

    const contextStart = Date.now();
    const context = await this.browserManager.createContext({ visible: isVisibleMode });
    console.log(`[WORKER_LIFECYCLE] Browser context created in ${Date.now() - contextStart}ms`);

    console.log(`[WORKER_LIFECYCLE] Creating FlowWorker instance...`);
    const worker = new FlowWorker(taskId, context);
    console.log(`[WORKER_LIFECYCLE] FlowWorker created`);

    return { worker, context };
  }

  /**
   * Clean up a worker and its context.
   */
  async cleanupWorker(worker: FlowWorker, context: BrowserContext): Promise<void> {
    console.log(`[WORKER_LIFECYCLE] Cleaning up worker...`);

    await worker.cleanup();
    console.log(`[WORKER_LIFECYCLE] worker.cleanup() done`);

    await this.browserManager.closeContext(context);
    console.log(`[WORKER_LIFECYCLE] closeContext() done`);
  }

  /**
   * Abort a worker and clean up.
   */
  async abortWorker(worker: FlowWorker, context: BrowserContext): Promise<void> {
    try {
      await worker.abort();
      await this.browserManager.closeContext(context);
    } catch {
      /* ignore errors during abort */
    }
  }

  /**
   * Abort multiple workers from a waiting_user state.
   */
  async abortWaitingWorkers(entries: [string, WaitingWorkerEntry][]): Promise<void> {
    await Promise.all(
      entries.map(async ([taskId, entry]) => {
        try {
          await entry.worker.abort();
          await this.browserManager.closeContext(entry.context);
        } catch {
          /* ignore */
        }
      })
    );
  }

  /**
   * Close context only (for manual close scenarios).
   */
  async closeContext(context: BrowserContext): Promise<void> {
    try {
      await this.browserManager.closeContext(context);
    } catch {
      /* ignore errors - context may already be closed */
    }
  }
}

import type { BrowserContext } from "playwright";
import type { BrowserManager } from "../browser";
import { FlowWorker } from "../workers";
import type { WaitingWorkerEntry } from "./types";
import { engineLogger } from "../EngineLogger";

const log = engineLogger.for("WorkerLifecycle");

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
    log.debug(`Creating browser context for task ${taskShortId}...`);
    log.debug(`Visible mode: ${isVisibleMode}`);

    const contextStart = Date.now();
    const context = await this.browserManager.createContext({ visible: isVisibleMode });
    log.debug(`Browser context created in ${Date.now() - contextStart}ms`);

    log.debug(`Creating FlowWorker instance...`);
    const worker = new FlowWorker(taskId, context);
    log.debug(`FlowWorker created`);

    return { worker, context };
  }

  /**
   * Clean up a worker and its context.
   */
  async cleanupWorker(worker: FlowWorker, context: BrowserContext): Promise<void> {
    log.debug(`Cleaning up worker...`);

    await worker.cleanup();
    log.debug(`worker.cleanup() done`);

    await this.browserManager.closeContext(context);
    log.debug(`closeContext() done`);
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

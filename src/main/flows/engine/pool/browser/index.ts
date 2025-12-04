import type { BrowserContext, LaunchOptions } from "playwright-extra";
import { BrowserInstancePool } from "./BrowserInstancePool";
import { ContextFactory } from "./ContextFactory";
import type { CreateContextOptions } from "./types";

// Re-export types
export type { CreateContextOptions, BrowserManagerOptions, BrowserType } from "./types";
export { HEALTH_CHECK_TIMEOUT_MS, CONTEXT_CREATION_TIMEOUT_MS, CLOSE_TIMEOUT_MS } from "./types";

// Re-export classes for direct access
export { ProcessHealthChecker, processHealthChecker } from "./ProcessHealthChecker";
export { BrowserInstancePool } from "./BrowserInstancePool";
export { ContextFactory } from "./ContextFactory";

/**
 * BrowserManager - Facade for browser management.
 * Maintains backward compatibility with the original API.
 *
 * Manages browser instances and creates isolated contexts for parallel flow execution.
 * Supports both headless (default) and visible modes for manual takeover.
 * Each context has its own cookies, localStorage, and session state.
 */
export class BrowserManager {
  private pool: BrowserInstancePool;
  private contextFactory: ContextFactory;

  constructor(options?: LaunchOptions) {
    this.pool = new BrowserInstancePool(options);
    this.contextFactory = new ContextFactory(this.pool);
  }

  /** Launch the headless browser instance */
  async launch(): Promise<void> {
    return this.pool.launch();
  }

  /** Launch the visible (non-headless) browser instance for manual takeover mode */
  async launchVisible(): Promise<void> {
    return this.pool.launchVisible();
  }

  /** Create a new isolated browser context */
  async createContext(options?: CreateContextOptions): Promise<BrowserContext> {
    return this.contextFactory.createContext(options?.visible ?? false);
  }

  /** Close a specific browser context */
  async closeContext(context: BrowserContext): Promise<void> {
    return this.contextFactory.closeContext(context);
  }

  /** Force close the headless browser */
  async forceClose(): Promise<void> {
    return this.pool.forceClose();
  }

  /** Force close the visible browser */
  async forceCloseVisible(): Promise<void> {
    return this.pool.forceCloseVisible();
  }

  /** Close all contexts and both browser instances */
  async close(): Promise<void> {
    return this.pool.close();
  }

  /** Check if any browser is currently running */
  isRunning(): boolean {
    return this.pool.isRunning();
  }

  /** Check if the visible browser is running */
  isVisibleRunning(): boolean {
    return this.pool.isVisibleRunning();
  }

  /** Get the number of active contexts (headless only) */
  getActiveContextCount(): number {
    return this.pool.getActiveContextCount();
  }

  /** Get the number of active visible contexts */
  getActiveVisibleContextCount(): number {
    return this.pool.getActiveVisibleContextCount();
  }

  /** Get the total number of active contexts (both browsers) */
  getTotalActiveContextCount(): number {
    return this.pool.getTotalActiveContextCount();
  }
}

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import type { ExecutionOptions } from '../types/FlowTypes';

/**
 * Manages a pool of browser contexts for parallel execution.
 * Reuses browser instance, creates separate contexts per worker.
 */
export class BrowserPool {
  private browser: Browser | null = null;
  private contexts: Map<number, BrowserContext> = new Map();
  private options: ExecutionOptions;

  constructor(options: ExecutionOptions = {}) {
    this.options = {
      headless: options.headless ?? true,
      timeout: options.timeout ?? 30000,
      screenshots: options.screenshots ?? true,
      video: options.video ?? false,
    };
  }

  /**
   * Initialize browser instance
   */
  async initialize(): Promise<void> {
    if (this.browser) return;

    this.browser = await chromium.launch({
      headless: this.options.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  /**
   * Get or create context for worker
   */
  async getContext(workerId: number, recordVideo: boolean = false): Promise<BrowserContext> {
    if (!this.browser) {
      await this.initialize();
    }

    if (this.contexts.has(workerId)) {
      return this.contexts.get(workerId)!;
    }

    const contextOptions: Parameters<Browser['newContext']>[0] = {
      viewport: { width: 1920, height: 1080 },
      recordVideo: recordVideo && this.options.video
        ? { dir: './artifacts/videos' }
        : undefined,
    };

    const context = await this.browser!.newContext(contextOptions);
    context.setDefaultTimeout(this.options.timeout!);
    this.contexts.set(workerId, context);

    return context;
  }

  /**
   * Create new page in worker context
   */
  async newPage(workerId: number): Promise<Page> {
    const context = await this.getContext(workerId);
    return await context.newPage();
  }

  /**
   * Close context for worker
   */
  async closeContext(workerId: number): Promise<void> {
    const context = this.contexts.get(workerId);
    if (context) {
      await context.close();
      this.contexts.delete(workerId);
    }
  }

  /**
   * Close all contexts and browser
   */
  async close(): Promise<void> {
    for (const [workerId] of this.contexts) {
      await this.closeContext(workerId);
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Get active context count
   */
  getActiveContextCount(): number {
    return this.contexts.size;
  }
}

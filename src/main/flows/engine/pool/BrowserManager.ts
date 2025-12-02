import { chromium, type Browser, type BrowserContext, type LaunchOptions } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Apply stealth plugin to avoid headless detection
chromium.use(StealthPlugin());

/**
 * Manages a single browser instance and creates isolated contexts for parallel flow execution.
 * Each context has its own cookies, localStorage, and session state.
 */
export class BrowserManager {
  private browser: Browser | null = null;
  private contexts: Set<BrowserContext> = new Set();
  private launchOptions: LaunchOptions;

  constructor(options?: LaunchOptions) {
    this.launchOptions = {
      headless: true,
      ...options,
    };
  }

  /**
   * Launch the browser instance.
   * Should be called once before creating contexts.
   */
  async launch(): Promise<void> {
    if (this.browser) {
      return; // Already launched
    }
    this.browser = await chromium.launch(this.launchOptions);
  }

  /**
   * Create a new isolated browser context.
   * Each context has separate cookies, localStorage, and session state.
   */
  async createContext(): Promise<BrowserContext> {
    if (!this.browser) {
      throw new Error("Browser not launched. Call launch() first.");
    }

    const context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });

    this.contexts.add(context);
    return context;
  }

  /**
   * Close a specific browser context and release its resources.
   */
  async closeContext(context: BrowserContext): Promise<void> {
    if (this.contexts.has(context)) {
      await context.close();
      this.contexts.delete(context);
    }
  }

  /**
   * Close all contexts and the browser instance.
   */
  async close(): Promise<void> {
    // Close all remaining contexts
    for (const context of this.contexts) {
      try {
        await context.close();
      } catch {
        // Ignore errors during cleanup
      }
    }
    this.contexts.clear();

    // Close the browser
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Check if the browser is currently running.
   */
  isRunning(): boolean {
    return this.browser !== null;
  }

  /**
   * Get the number of active contexts.
   */
  getActiveContextCount(): number {
    return this.contexts.size;
  }
}

import { chromium, type Browser, type BrowserContext, type LaunchOptions } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Apply stealth plugin to avoid headless detection
chromium.use(StealthPlugin());

// Timeouts for browser operations
const HEALTH_CHECK_TIMEOUT_MS = 5000;
const CONTEXT_CREATION_TIMEOUT_MS = 30000;
const CLOSE_TIMEOUT_MS = 5000;

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
   * Check if the browser process is healthy and responsive.
   * Returns false if browser is zombie (JS object exists but process is dead).
   */
  private async isHealthy(): Promise<boolean> {
    if (!this.browser) return false;
    try {
      // Try to get browser version - will fail if process is dead
      await Promise.race([
        this.browser.version(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Health check timeout")), HEALTH_CHECK_TIMEOUT_MS)
        ),
      ]);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Launch the browser instance.
   * Should be called once before creating contexts.
   */
  async launch(): Promise<void> {
    if (this.browser) {
      return; // Already launched
    }
    console.log("[BROWSER_MANAGER] Launching browser...");
    this.browser = await chromium.launch(this.launchOptions);
    console.log("[BROWSER_MANAGER] Browser launched successfully");
  }

  /**
   * Create a new isolated browser context.
   * Each context has separate cookies, localStorage, and session state.
   * Includes health check and timeout to prevent zombie browser freeze.
   */
  async createContext(): Promise<BrowserContext> {
    if (!this.browser) {
      throw new Error("Browser not launched. Call launch() first.");
    }

    // Health check before creating context - detect zombie browsers
    if (!(await this.isHealthy())) {
      console.warn("[BROWSER_MANAGER] Browser unhealthy (zombie state detected), forcing restart...");
      await this.forceClose();
      await this.launch();
    }

    // Add timeout to prevent infinite hang on newContext()
    const contextPromise = this.browser!.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Context creation timed out after ${CONTEXT_CREATION_TIMEOUT_MS}ms`)),
        CONTEXT_CREATION_TIMEOUT_MS
      )
    );

    const context = await Promise.race([contextPromise, timeoutPromise]);
    this.contexts.add(context);
    return context;
  }

  /**
   * Force close the browser, killing the process if necessary.
   * Use this when normal close() fails or browser is unresponsive.
   */
  async forceClose(): Promise<void> {
    if (!this.browser) return;

    console.log("[BROWSER_MANAGER] Force closing browser...");

    try {
      const closePromise = this.browser.close();
      await Promise.race([
        closePromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Close timeout")), CLOSE_TIMEOUT_MS)
        ),
      ]);
    } catch {
      console.warn("[BROWSER_MANAGER] Normal close failed, killing browser process...");
      try {
        // Access internal process for force kill
        const proc = this.browser.process();
        if (proc) {
          proc.kill("SIGKILL");
          console.log("[BROWSER_MANAGER] Browser process killed");
        }
      } catch {
        /* ignore - process may already be dead */
      }
    }

    this.browser = null;
    this.contexts.clear();
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

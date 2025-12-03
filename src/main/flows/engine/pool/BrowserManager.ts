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
    console.log("[BROWSER_MANAGER] isHealthy() called");
    if (!this.browser) {
      console.log("[BROWSER_MANAGER] isHealthy: No browser instance");
      return false;
    }
    try {
      console.log("[BROWSER_MANAGER] isHealthy: Checking browser.version()...");
      // Try to get browser version - will fail if process is dead
      const version = await Promise.race([
        this.browser.version(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Health check timeout")), HEALTH_CHECK_TIMEOUT_MS)
        ),
      ]);
      console.log(`[BROWSER_MANAGER] isHealthy: Browser version = ${version}`);
      return true;
    } catch (error) {
      console.error("[BROWSER_MANAGER] isHealthy: Health check FAILED", error);
      return false;
    }
  }

  /**
   * Launch the browser instance.
   * Should be called once before creating contexts.
   */
  async launch(): Promise<void> {
    console.log("[BROWSER_MANAGER] launch() called");
    console.log(`[BROWSER_MANAGER] Current browser instance: ${!!this.browser}`);

    if (this.browser) {
      console.log("[BROWSER_MANAGER] Browser already launched, skipping");
      return; // Already launched
    }

    console.log("[BROWSER_MANAGER] Launching browser...");
    console.log(`[BROWSER_MANAGER] Launch options: ${JSON.stringify(this.launchOptions)}`);

    const launchStart = Date.now();
    this.browser = await chromium.launch(this.launchOptions);
    console.log(`[BROWSER_MANAGER] Browser launched successfully in ${Date.now() - launchStart}ms`);

    // Try to get PID safely (may not be available with playwright-extra)
    try {
      const proc = this.browser.process?.();
      if (proc?.pid) {
        console.log(`[BROWSER_MANAGER] Browser PID: ${proc.pid}`);
      } else {
        console.log(`[BROWSER_MANAGER] Browser PID: N/A (process() not available)`);
      }
    } catch {
      console.log(`[BROWSER_MANAGER] Browser PID: N/A (process() not supported)`);
    }
  }

  /**
   * Create a new isolated browser context.
   * Each context has separate cookies, localStorage, and session state.
   * Includes health check and timeout to prevent zombie browser freeze.
   */
  async createContext(): Promise<BrowserContext> {
    console.log("[BROWSER_MANAGER] createContext() called");
    console.log(`[BROWSER_MANAGER] Browser instance exists: ${!!this.browser}`);
    console.log(`[BROWSER_MANAGER] Current active contexts: ${this.contexts.size}`);

    if (!this.browser) {
      console.error("[BROWSER_MANAGER] ERROR: Browser not launched!");
      throw new Error("Browser not launched. Call launch() first.");
    }

    // Health check before creating context - detect zombie browsers
    console.log("[BROWSER_MANAGER] Starting health check...");
    const healthCheckStart = Date.now();
    const isHealthy = await this.isHealthy();
    console.log(`[BROWSER_MANAGER] Health check completed in ${Date.now() - healthCheckStart}ms | Result: ${isHealthy}`);

    if (!isHealthy) {
      console.warn("[BROWSER_MANAGER] Browser unhealthy (zombie state detected), forcing restart...");
      await this.forceClose();
      await this.launch();
    }

    // Add timeout to prevent infinite hang on newContext()
    console.log("[BROWSER_MANAGER] Creating new browser context...");
    const contextStart = Date.now();

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

    console.log("[BROWSER_MANAGER] Awaiting Promise.race for context creation...");
    const context = await Promise.race([contextPromise, timeoutPromise]);
    console.log(`[BROWSER_MANAGER] Context created in ${Date.now() - contextStart}ms`);

    this.contexts.add(context);
    console.log(`[BROWSER_MANAGER] Context added to set | Total contexts: ${this.contexts.size}`);
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

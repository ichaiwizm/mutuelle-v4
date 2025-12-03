import { chromium, type Browser, type BrowserContext, type LaunchOptions } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Apply stealth plugin to avoid headless detection
chromium.use(StealthPlugin());

// Timeouts for browser operations
const HEALTH_CHECK_TIMEOUT_MS = 5000;
const CONTEXT_CREATION_TIMEOUT_MS = 30000;
const CLOSE_TIMEOUT_MS = 5000;

export type CreateContextOptions = {
  /** If true, use visible (non-headless) browser */
  visible?: boolean;
};

/**
 * Manages browser instances and creates isolated contexts for parallel flow execution.
 * Supports both headless (default) and visible modes for manual takeover.
 * Each context has its own cookies, localStorage, and session state.
 */
export class BrowserManager {
  // Headless browser (default)
  private browser: Browser | null = null;
  private contexts: Set<BrowserContext> = new Set();

  // Visible browser (for manual takeover mode)
  private visibleBrowser: Browser | null = null;
  private visibleContexts: Set<BrowserContext> = new Set();

  private launchOptions: LaunchOptions;

  constructor(options?: LaunchOptions) {
    this.launchOptions = {
      headless: true,
      ...options,
    };
  }

  /**
   * Check if a browser process is healthy and responsive.
   * Returns false if browser is zombie (JS object exists but process is dead).
   */
  private async isHealthy(browserInstance: Browser | null, label: string): Promise<boolean> {
    console.log(`[BROWSER_MANAGER] isHealthy(${label}) called`);
    if (!browserInstance) {
      console.log(`[BROWSER_MANAGER] isHealthy(${label}): No browser instance`);
      return false;
    }
    try {
      console.log(`[BROWSER_MANAGER] isHealthy(${label}): Checking browser.version()...`);
      // Try to get browser version - will fail if process is dead
      const version = await Promise.race([
        browserInstance.version(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Health check timeout")), HEALTH_CHECK_TIMEOUT_MS)
        ),
      ]);
      console.log(`[BROWSER_MANAGER] isHealthy(${label}): Browser version = ${version}`);
      return true;
    } catch (error) {
      console.error(`[BROWSER_MANAGER] isHealthy(${label}): Health check FAILED`, error);
      return false;
    }
  }

  /**
   * Launch the headless browser instance.
   * Should be called once before creating contexts.
   */
  async launch(): Promise<void> {
    console.log("[BROWSER_MANAGER] launch() called");
    console.log(`[BROWSER_MANAGER] Current browser instance: ${!!this.browser}`);

    if (this.browser) {
      console.log("[BROWSER_MANAGER] Browser already launched, skipping");
      return; // Already launched
    }

    console.log("[BROWSER_MANAGER] Launching headless browser...");
    console.log(`[BROWSER_MANAGER] Launch options: ${JSON.stringify(this.launchOptions)}`);

    const launchStart = Date.now();
    this.browser = await chromium.launch(this.launchOptions);
    console.log(`[BROWSER_MANAGER] Headless browser launched successfully in ${Date.now() - launchStart}ms`);

    this.logBrowserPid(this.browser, "headless");
  }

  /**
   * Launch the visible (non-headless) browser instance for manual takeover mode.
   * The browser window starts minimized to avoid disturbing the user.
   */
  async launchVisible(): Promise<void> {
    console.log("[BROWSER_MANAGER] launchVisible() called");
    console.log(`[BROWSER_MANAGER] Current visible browser instance: ${!!this.visibleBrowser}`);

    if (this.visibleBrowser) {
      console.log("[BROWSER_MANAGER] Visible browser already launched, skipping");
      return; // Already launched
    }

    console.log("[BROWSER_MANAGER] Launching visible browser...");

    const visibleOptions: LaunchOptions = {
      ...this.launchOptions,
      headless: false,
      args: [
        ...(this.launchOptions.args ?? []),
        "--start-minimized", // Start minimized (works on Windows/some Linux)
      ],
    };
    console.log(`[BROWSER_MANAGER] Visible launch options: ${JSON.stringify(visibleOptions)}`);

    const launchStart = Date.now();
    this.visibleBrowser = await chromium.launch(visibleOptions);
    console.log(`[BROWSER_MANAGER] Visible browser launched successfully in ${Date.now() - launchStart}ms`);

    this.logBrowserPid(this.visibleBrowser, "visible");
  }

  /**
   * Helper to log browser PID safely
   */
  private logBrowserPid(browser: Browser, label: string): void {
    try {
      const proc = browser.process?.();
      if (proc?.pid) {
        console.log(`[BROWSER_MANAGER] ${label} browser PID: ${proc.pid}`);
      } else {
        console.log(`[BROWSER_MANAGER] ${label} browser PID: N/A (process() not available)`);
      }
    } catch {
      console.log(`[BROWSER_MANAGER] ${label} browser PID: N/A (process() not supported)`);
    }
  }

  /**
   * Create a new isolated browser context.
   * Each context has separate cookies, localStorage, and session state.
   * Includes health check and timeout to prevent zombie browser freeze.
   *
   * @param options.visible - If true, use the visible browser instead of headless
   */
  async createContext(options?: CreateContextOptions): Promise<BrowserContext> {
    const useVisible = options?.visible ?? false;
    const label = useVisible ? "visible" : "headless";

    console.log(`[BROWSER_MANAGER] createContext(${label}) called`);

    // Get the appropriate browser instance
    let browserInstance = useVisible ? this.visibleBrowser : this.browser;
    const contextSet = useVisible ? this.visibleContexts : this.contexts;

    console.log(`[BROWSER_MANAGER] ${label} browser exists: ${!!browserInstance}`);
    console.log(`[BROWSER_MANAGER] Current ${label} active contexts: ${contextSet.size}`);

    // Launch the browser if not already done
    if (!browserInstance) {
      console.log(`[BROWSER_MANAGER] ${label} browser not launched, launching now...`);
      if (useVisible) {
        await this.launchVisible();
        browserInstance = this.visibleBrowser;
      } else {
        await this.launch();
        browserInstance = this.browser;
      }
    }

    if (!browserInstance) {
      console.error(`[BROWSER_MANAGER] ERROR: ${label} browser not launched!`);
      throw new Error(`${label} browser not launched.`);
    }

    // Health check before creating context - detect zombie browsers
    console.log(`[BROWSER_MANAGER] Starting health check for ${label}...`);
    const healthCheckStart = Date.now();
    const healthy = await this.isHealthy(browserInstance, label);
    console.log(`[BROWSER_MANAGER] Health check completed in ${Date.now() - healthCheckStart}ms | Result: ${healthy}`);

    if (!healthy) {
      console.warn(`[BROWSER_MANAGER] ${label} browser unhealthy (zombie state detected), forcing restart...`);
      if (useVisible) {
        await this.forceCloseVisible();
        await this.launchVisible();
        browserInstance = this.visibleBrowser;
      } else {
        await this.forceClose();
        await this.launch();
        browserInstance = this.browser;
      }
    }

    // Add timeout to prevent infinite hang on newContext()
    console.log(`[BROWSER_MANAGER] Creating new ${label} browser context...`);
    const contextStart = Date.now();

    const contextPromise = browserInstance!.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Context creation timed out after ${CONTEXT_CREATION_TIMEOUT_MS}ms`)),
        CONTEXT_CREATION_TIMEOUT_MS
      )
    );

    console.log(`[BROWSER_MANAGER] Awaiting Promise.race for ${label} context creation...`);
    const context = await Promise.race([contextPromise, timeoutPromise]);
    console.log(`[BROWSER_MANAGER] ${label} context created in ${Date.now() - contextStart}ms`);

    contextSet.add(context);
    console.log(`[BROWSER_MANAGER] ${label} context added to set | Total contexts: ${contextSet.size}`);
    return context;
  }

  /**
   * Force close the headless browser, killing the process if necessary.
   * Use this when normal close() fails or browser is unresponsive.
   */
  async forceClose(): Promise<void> {
    if (!this.browser) return;

    console.log("[BROWSER_MANAGER] Force closing headless browser...");

    try {
      const closePromise = this.browser.close();
      await Promise.race([
        closePromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Close timeout")), CLOSE_TIMEOUT_MS)
        ),
      ]);
    } catch {
      console.warn("[BROWSER_MANAGER] Normal close failed, killing headless browser process...");
      try {
        const proc = this.browser.process();
        if (proc) {
          proc.kill("SIGKILL");
          console.log("[BROWSER_MANAGER] Headless browser process killed");
        }
      } catch {
        /* ignore - process may already be dead */
      }
    }

    this.browser = null;
    this.contexts.clear();
  }

  /**
   * Force close the visible browser, killing the process if necessary.
   */
  async forceCloseVisible(): Promise<void> {
    if (!this.visibleBrowser) return;

    console.log("[BROWSER_MANAGER] Force closing visible browser...");

    try {
      const closePromise = this.visibleBrowser.close();
      await Promise.race([
        closePromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Close timeout")), CLOSE_TIMEOUT_MS)
        ),
      ]);
    } catch {
      console.warn("[BROWSER_MANAGER] Normal close failed, killing visible browser process...");
      try {
        const proc = this.visibleBrowser.process();
        if (proc) {
          proc.kill("SIGKILL");
          console.log("[BROWSER_MANAGER] Visible browser process killed");
        }
      } catch {
        /* ignore - process may already be dead */
      }
    }

    this.visibleBrowser = null;
    this.visibleContexts.clear();
  }

  /**
   * Close a specific browser context and release its resources.
   * Automatically detects which browser set the context belongs to.
   */
  async closeContext(context: BrowserContext): Promise<void> {
    if (this.contexts.has(context)) {
      await context.close();
      this.contexts.delete(context);
    } else if (this.visibleContexts.has(context)) {
      await context.close();
      this.visibleContexts.delete(context);
    }
  }

  /**
   * Close all contexts and both browser instances.
   */
  async close(): Promise<void> {
    // Close all headless contexts
    for (const context of this.contexts) {
      try {
        await context.close();
      } catch {
        // Ignore errors during cleanup
      }
    }
    this.contexts.clear();

    // Close all visible contexts
    for (const context of this.visibleContexts) {
      try {
        await context.close();
      } catch {
        // Ignore errors during cleanup
      }
    }
    this.visibleContexts.clear();

    // Close the headless browser
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    // Close the visible browser
    if (this.visibleBrowser) {
      await this.visibleBrowser.close();
      this.visibleBrowser = null;
    }
  }

  /**
   * Check if any browser is currently running.
   */
  isRunning(): boolean {
    return this.browser !== null || this.visibleBrowser !== null;
  }

  /**
   * Check if the visible browser is running.
   */
  isVisibleRunning(): boolean {
    return this.visibleBrowser !== null;
  }

  /**
   * Get the number of active contexts (headless only).
   */
  getActiveContextCount(): number {
    return this.contexts.size;
  }

  /**
   * Get the number of active visible contexts.
   */
  getActiveVisibleContextCount(): number {
    return this.visibleContexts.size;
  }

  /**
   * Get the total number of active contexts (both browsers).
   */
  getTotalActiveContextCount(): number {
    return this.contexts.size + this.visibleContexts.size;
  }
}

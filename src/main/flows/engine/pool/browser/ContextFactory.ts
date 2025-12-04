import type { Browser, BrowserContext } from "playwright-extra";
import { CONTEXT_CREATION_TIMEOUT_MS } from "./types";
import { processHealthChecker } from "./ProcessHealthChecker";
import type { BrowserInstancePool } from "./BrowserInstancePool";

/**
 * Creates and manages isolated browser contexts.
 * Includes health checks and timeout protection.
 */
export class ContextFactory {
  constructor(private pool: BrowserInstancePool) {}

  /**
   * Create a new isolated browser context.
   * Each context has separate cookies, localStorage, and session state.
   * Includes health check and timeout to prevent zombie browser freeze.
   *
   * @param visible - If true, use the visible browser instead of headless
   */
  async createContext(visible: boolean = false): Promise<BrowserContext> {
    const label = visible ? "visible" : "headless";

    console.log(`[BROWSER_MANAGER] createContext(${label}) called`);

    // Get the appropriate browser instance
    let browserInstance = visible ? this.pool.getVisibleBrowser() : this.pool.getBrowser();
    const contextSet = visible ? this.pool.getVisibleContexts() : this.pool.getContexts();

    console.log(`[BROWSER_MANAGER] ${label} browser exists: ${!!browserInstance}`);
    console.log(`[BROWSER_MANAGER] Current ${label} active contexts: ${contextSet.size}`);

    // Launch the browser if not already done
    if (!browserInstance) {
      console.log(`[BROWSER_MANAGER] ${label} browser not launched, launching now...`);
      if (visible) {
        await this.pool.launchVisible();
        browserInstance = this.pool.getVisibleBrowser();
      } else {
        await this.pool.launch();
        browserInstance = this.pool.getBrowser();
      }
    }

    if (!browserInstance) {
      console.error(`[BROWSER_MANAGER] ERROR: ${label} browser not launched!`);
      throw new Error(`${label} browser not launched.`);
    }

    // Health check before creating context - detect zombie browsers
    console.log(`[BROWSER_MANAGER] Starting health check for ${label}...`);
    const healthCheckStart = Date.now();
    const healthy = await processHealthChecker.isHealthy(browserInstance, label);
    console.log(`[BROWSER_MANAGER] Health check completed in ${Date.now() - healthCheckStart}ms | Result: ${healthy}`);

    if (!healthy) {
      console.warn(`[BROWSER_MANAGER] ${label} browser unhealthy (zombie state detected), forcing restart...`);
      browserInstance = await this.restartBrowser(visible);
    }

    // Add timeout to prevent infinite hang on newContext()
    console.log(`[BROWSER_MANAGER] Creating new ${label} browser context...`);
    const contextStart = Date.now();

    const context = await this.createContextWithTimeout(browserInstance!);
    console.log(`[BROWSER_MANAGER] ${label} context created in ${Date.now() - contextStart}ms`);

    contextSet.add(context);
    console.log(`[BROWSER_MANAGER] ${label} context added to set | Total contexts: ${contextSet.size}`);
    return context;
  }

  /**
   * Create context with timeout protection
   */
  private async createContextWithTimeout(browser: Browser): Promise<BrowserContext> {
    const contextPromise = browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Context creation timed out after ${CONTEXT_CREATION_TIMEOUT_MS}ms`)),
        CONTEXT_CREATION_TIMEOUT_MS
      )
    );

    console.log(`[BROWSER_MANAGER] Awaiting Promise.race for context creation...`);
    return await Promise.race([contextPromise, timeoutPromise]);
  }

  /**
   * Restart browser after health check failure
   */
  private async restartBrowser(visible: boolean): Promise<Browser> {
    if (visible) {
      await this.pool.forceCloseVisible();
      await this.pool.launchVisible();
      return this.pool.getVisibleBrowser()!;
    } else {
      await this.pool.forceClose();
      await this.pool.launch();
      return this.pool.getBrowser()!;
    }
  }

  /**
   * Close a specific browser context and release its resources.
   * Automatically detects which browser set the context belongs to.
   */
  async closeContext(context: BrowserContext): Promise<void> {
    const headlessContexts = this.pool.getContexts();
    const visibleContexts = this.pool.getVisibleContexts();

    if (headlessContexts.has(context)) {
      await context.close();
      headlessContexts.delete(context);
    } else if (visibleContexts.has(context)) {
      await context.close();
      visibleContexts.delete(context);
    }
  }
}

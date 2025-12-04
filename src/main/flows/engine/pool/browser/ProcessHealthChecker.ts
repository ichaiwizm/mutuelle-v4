import type { Browser, BrowserContext } from "playwright-extra";
import { HEALTH_CHECK_TIMEOUT_MS, CLOSE_TIMEOUT_MS } from "./types";

/**
 * Handles browser health checks and force close operations.
 * Detects zombie browsers (JS object exists but process is dead).
 */
export class ProcessHealthChecker {
  /**
   * Check if a browser process is healthy and responsive.
   * Returns false if browser is zombie (JS object exists but process is dead).
   */
  async isHealthy(browserInstance: Browser | null, label: string): Promise<boolean> {
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
   * Force close a browser, killing the process if necessary.
   * Use this when normal close() fails or browser is unresponsive.
   */
  async forceClose(
    browser: Browser | null,
    contexts: Set<BrowserContext>,
    label: string
  ): Promise<void> {
    if (!browser) return;

    console.log(`[BROWSER_MANAGER] Force closing ${label} browser...`);

    try {
      const closePromise = browser.close();
      await Promise.race([
        closePromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Close timeout")), CLOSE_TIMEOUT_MS)
        ),
      ]);
    } catch {
      console.warn(`[BROWSER_MANAGER] Normal close failed, killing ${label} browser process...`);
      try {
        const proc = browser.process();
        if (proc) {
          proc.kill("SIGKILL");
          console.log(`[BROWSER_MANAGER] ${label} browser process killed`);
        }
      } catch {
        /* ignore - process may already be dead */
      }
    }

    contexts.clear();
  }

  /**
   * Helper to log browser PID safely
   */
  logBrowserPid(browser: Browser, label: string): void {
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
}

/** Singleton instance */
export const processHealthChecker = new ProcessHealthChecker();

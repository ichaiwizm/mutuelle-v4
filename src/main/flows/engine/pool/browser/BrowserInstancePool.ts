import { chromium, type Browser, type BrowserContext, type LaunchOptions } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { processHealthChecker } from "./ProcessHealthChecker";
import { readdirSync } from "node:fs";
import { join } from "node:path";

// Apply stealth plugin to avoid headless detection
chromium.use(StealthPlugin());

/**
 * Get the path to the bundled Chromium executable (production only).
 * In dev, returns undefined to let Playwright use its default.
 */
function getBundledChromiumPath(): string | undefined {
  const isDev = !!process.env.ELECTRON_RENDERER_URL;
  if (isDev) return undefined;

  try {
    const browsersDir = join(process.resourcesPath, "playwright-browsers");
    const entries = readdirSync(browsersDir);
    const chromiumFolder = entries.find((e) => e.startsWith("chromium-"));

    if (!chromiumFolder) {
      console.error("[BROWSER] No chromium folder found in", browsersDir);
      return undefined;
    }

    // Sur Mac: chromium-XXXX/chrome-mac/Chromium.app/Contents/MacOS/Chromium
    const execPath = join(
      browsersDir,
      chromiumFolder,
      "chrome-mac",
      "Chromium.app",
      "Contents",
      "MacOS",
      "Chromium"
    );

    console.log("[BROWSER] Using bundled Chromium:", execPath);
    return execPath;
  } catch (err) {
    console.error("[BROWSER] Error finding bundled Chromium:", err);
    return undefined;
  }
}

/**
 * Manages browser instance lifecycle (headless and visible modes).
 * Handles launch, close, and force restart operations.
 */
export class BrowserInstancePool {
  // Headless browser (default)
  private browser: Browser | null = null;
  private contexts: Set<BrowserContext> = new Set();

  // Visible browser (for manual takeover mode)
  private visibleBrowser: Browser | null = null;
  private visibleContexts: Set<BrowserContext> = new Set();

  private launchOptions: LaunchOptions;

  constructor(options?: LaunchOptions) {
    const executablePath = getBundledChromiumPath();
    this.launchOptions = {
      headless: true,
      executablePath,
      ...options,
    };
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
      return;
    }

    console.log("[BROWSER_MANAGER] Launching headless browser...");
    console.log(`[BROWSER_MANAGER] Launch options: ${JSON.stringify(this.launchOptions)}`);

    const launchStart = Date.now();
    this.browser = await chromium.launch(this.launchOptions);
    console.log(`[BROWSER_MANAGER] Headless browser launched successfully in ${Date.now() - launchStart}ms`);

    processHealthChecker.logBrowserPid(this.browser, "headless");
  }

  /**
   * Launch the visible (non-headless) browser instance for manual takeover mode.
   */
  async launchVisible(): Promise<void> {
    console.log("[BROWSER_MANAGER] launchVisible() called");
    console.log(`[BROWSER_MANAGER] Current visible browser instance: ${!!this.visibleBrowser}`);

    if (this.visibleBrowser) {
      console.log("[BROWSER_MANAGER] Visible browser already launched, skipping");
      return;
    }

    console.log("[BROWSER_MANAGER] Launching visible browser...");

    const visibleOptions: LaunchOptions = {
      ...this.launchOptions,
      headless: false,
    };
    console.log(`[BROWSER_MANAGER] Visible launch options: ${JSON.stringify(visibleOptions)}`);

    const launchStart = Date.now();
    this.visibleBrowser = await chromium.launch(visibleOptions);
    console.log(`[BROWSER_MANAGER] Visible browser launched successfully in ${Date.now() - launchStart}ms`);

    processHealthChecker.logBrowserPid(this.visibleBrowser, "visible");
  }

  /** Get the headless browser instance */
  getBrowser(): Browser | null {
    return this.browser;
  }

  /** Get the visible browser instance */
  getVisibleBrowser(): Browser | null {
    return this.visibleBrowser;
  }

  /** Get the contexts set for headless browser */
  getContexts(): Set<BrowserContext> {
    return this.contexts;
  }

  /** Get the contexts set for visible browser */
  getVisibleContexts(): Set<BrowserContext> {
    return this.visibleContexts;
  }

  /**
   * Force close the headless browser, killing the process if necessary.
   */
  async forceClose(): Promise<void> {
    await processHealthChecker.forceClose(this.browser, this.contexts, "headless");
    this.browser = null;
  }

  /**
   * Force close the visible browser, killing the process if necessary.
   */
  async forceCloseVisible(): Promise<void> {
    await processHealthChecker.forceClose(this.visibleBrowser, this.visibleContexts, "visible");
    this.visibleBrowser = null;
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

  /** Check if any browser is currently running */
  isRunning(): boolean {
    return this.browser !== null || this.visibleBrowser !== null;
  }

  /** Check if the visible browser is running */
  isVisibleRunning(): boolean {
    return this.visibleBrowser !== null;
  }

  /** Get the number of active contexts (headless only) */
  getActiveContextCount(): number {
    return this.contexts.size;
  }

  /** Get the number of active visible contexts */
  getActiveVisibleContextCount(): number {
    return this.visibleContexts.size;
  }

  /** Get the total number of active contexts (both browsers) */
  getTotalActiveContextCount(): number {
    return this.contexts.size + this.visibleContexts.size;
  }
}

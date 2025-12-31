import type { Browser, BrowserContext, LaunchOptions } from "playwright";
import { chromium } from "playwright-extra";
import { processHealthChecker } from "./ProcessHealthChecker";
import type { BrowserType } from "./types";
import { engineLogger } from "../EngineLogger";

const log = engineLogger.for("BrowserManager");

export class BrowserInstance {
  private browser: Browser | null = null;
  private contexts: Set<BrowserContext> = new Set();
  private readonly type: BrowserType;
  private readonly launchOptions: LaunchOptions;

  constructor(type: BrowserType, baseOptions: LaunchOptions) {
    this.type = type;
    this.launchOptions = { ...baseOptions, headless: type === "headless" };
  }

  async launch(): Promise<void> {
    if (this.browser) return;
    log.debug(`Launching ${this.type} browser...`);
    const launchStart = Date.now();
    this.browser = await chromium.launch(this.launchOptions);
    log.debug(`${this.type} browser launched in ${Date.now() - launchStart}ms`);
    processHealthChecker.logBrowserPid(this.browser, this.type);
  }

  getBrowser(): Browser | null {
    return this.browser;
  }

  getContexts(): Set<BrowserContext> {
    return this.contexts;
  }

  isRunning(): boolean {
    return this.browser !== null;
  }

  getActiveContextCount(): number {
    return this.contexts.size;
  }

  async forceClose(): Promise<void> {
    await processHealthChecker.forceClose(this.browser, this.contexts, this.type);
    this.browser = null;
  }

  async close(): Promise<void> {
    for (const context of this.contexts) {
      try { await context.close(); } catch {}
    }
    this.contexts.clear();
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

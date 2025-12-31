import { chromium } from "playwright-extra";
import type { Browser, BrowserContext, LaunchOptions } from "playwright";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { getBundledChromiumPath } from "./chromiumPath";
import type { BrowserType } from "./types";
import { BrowserInstance } from "./BrowserInstance";

chromium.use(StealthPlugin());

export class BrowserInstancePool {
  private instances: Map<BrowserType, BrowserInstance>;

  constructor(options?: LaunchOptions) {
    const baseOptions: LaunchOptions = {
      headless: true,
      executablePath: getBundledChromiumPath(),
      ...options,
    };
    this.instances = new Map([
      ["headless", new BrowserInstance("headless", baseOptions)],
      ["visible", new BrowserInstance("visible", baseOptions)],
    ]);
  }

  private getInstance(type: BrowserType): BrowserInstance {
    return this.instances.get(type)!;
  }

  async launch(): Promise<void> {
    return this.getInstance("headless").launch();
  }

  async launchVisible(): Promise<void> {
    return this.getInstance("visible").launch();
  }

  getBrowser(): Browser | null {
    return this.getInstance("headless").getBrowser();
  }

  getVisibleBrowser(): Browser | null {
    return this.getInstance("visible").getBrowser();
  }

  getContexts(): Set<BrowserContext> {
    return this.getInstance("headless").getContexts();
  }

  getVisibleContexts(): Set<BrowserContext> {
    return this.getInstance("visible").getContexts();
  }

  async forceClose(): Promise<void> {
    return this.getInstance("headless").forceClose();
  }

  async forceCloseVisible(): Promise<void> {
    return this.getInstance("visible").forceClose();
  }

  async close(): Promise<void> {
    await Promise.all([
      this.getInstance("headless").close(),
      this.getInstance("visible").close(),
    ]);
  }

  isRunning(): boolean {
    return this.getInstance("headless").isRunning() || this.getInstance("visible").isRunning();
  }

  isVisibleRunning(): boolean {
    return this.getInstance("visible").isRunning();
  }

  getActiveContextCount(): number {
    return this.getInstance("headless").getActiveContextCount();
  }

  getActiveVisibleContextCount(): number {
    return this.getInstance("visible").getActiveContextCount();
  }

  getTotalActiveContextCount(): number {
    return this.getInstance("headless").getActiveContextCount() +
           this.getInstance("visible").getActiveContextCount();
  }
}

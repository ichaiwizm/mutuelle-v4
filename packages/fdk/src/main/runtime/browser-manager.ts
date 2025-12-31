/**
 * BrowserManager - Manages Playwright browser lifecycle
 * Handles browser launch, context creation, and cleanup
 */
import type { Browser, BrowserContext, Page, LaunchOptions } from 'playwright-core';
import { chromium } from 'playwright-core';

export interface BrowserConfig {
  headless?: boolean;
  slowMo?: number;
  devtools?: boolean;
  viewport?: { width: number; height: number };
}

const DEFAULT_CONFIG: BrowserConfig = {
  headless: false, // Headed for dev
  slowMo: 50,
  devtools: false,
  viewport: { width: 1280, height: 720 },
};

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  constructor(private config: BrowserConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async launch(): Promise<Page> {
    const launchOptions: LaunchOptions = {
      headless: this.config.headless,
      slowMo: this.config.slowMo,
      devtools: this.config.devtools,
    };

    this.browser = await chromium.launch(launchOptions);
    this.context = await this.browser.newContext({
      viewport: this.config.viewport,
      acceptDownloads: true,
      ignoreHTTPSErrors: true,
    });
    this.page = await this.context.newPage();

    return this.page;
  }

  getPage(): Page | null {
    return this.page;
  }

  async close(): Promise<void> {
    if (this.page) await this.page.close().catch(() => {});
    if (this.context) await this.context.close().catch(() => {});
    if (this.browser) await this.browser.close().catch(() => {});
    this.page = null;
    this.context = null;
    this.browser = null;
  }

  isRunning(): boolean {
    return this.browser !== null && this.browser.isConnected();
  }
}

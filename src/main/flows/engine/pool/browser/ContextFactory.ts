import type { Browser, BrowserContext } from "playwright";
import { CONTEXT_CREATION_TIMEOUT_MS } from "./types";
import { processHealthChecker } from "./ProcessHealthChecker";
import type { BrowserInstancePool } from "./BrowserInstancePool";
import { engineLogger } from "../EngineLogger";

const log = engineLogger.for("ContextFactory");

export class ContextFactory {
  constructor(private pool: BrowserInstancePool) {}

  async createContext(visible: boolean = false): Promise<BrowserContext> {
    const label = visible ? "visible" : "headless";
    let browserInstance = visible ? this.pool.getVisibleBrowser() : this.pool.getBrowser();
    const contextSet = visible ? this.pool.getVisibleContexts() : this.pool.getContexts();

    if (!browserInstance) {
      if (visible) {
        await this.pool.launchVisible();
        browserInstance = this.pool.getVisibleBrowser();
      } else {
        await this.pool.launch();
        browserInstance = this.pool.getBrowser();
      }
    }
    if (!browserInstance) throw new Error(`${label} browser not launched.`);

    const healthy = await processHealthChecker.isHealthy(browserInstance, label);
    if (!healthy) {
      log.warn(`${label} browser unhealthy, restarting...`);
      browserInstance = await this.restartBrowser(visible);
    }

    const context = await this.createContextWithTimeout(browserInstance!);
    contextSet.add(context);
    return context;
  }

  private async createContextWithTimeout(browser: Browser): Promise<BrowserContext> {
    const contextPromise = browser.newContext({ viewport: { width: 1280, height: 720 }, ignoreHTTPSErrors: true });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Context creation timed out after ${CONTEXT_CREATION_TIMEOUT_MS}ms`)), CONTEXT_CREATION_TIMEOUT_MS)
    );
    return await Promise.race([contextPromise, timeoutPromise]);
  }

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

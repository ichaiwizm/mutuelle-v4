import type { Page } from "playwright";

export class CDPWindowController {
  async minimizeWindow(page: Page, itemId: string): Promise<boolean> {
    try {
      if (page.isClosed()) return false;
      const cdpSession = await page.context().newCDPSession(page);
      const { windowId } = await cdpSession.send("Browser.getWindowForTarget");
      await cdpSession.send("Browser.setWindowBounds", { windowId, bounds: { windowState: "minimized" } });
      return true;
    } catch {
      return false;
    }
  }

  async restoreWindow(page: Page, itemId: string): Promise<boolean> {
    try {
      if (page.isClosed()) return false;
      const cdpSession = await page.context().newCDPSession(page);
      const { windowId } = await cdpSession.send("Browser.getWindowForTarget");
      await cdpSession.send("Browser.setWindowBounds", { windowId, bounds: { windowState: "normal" } });
      return true;
    } catch {
      return false;
    }
  }

  async maximizeWindow(page: Page, itemId: string): Promise<boolean> {
    try {
      if (page.isClosed()) return false;
      const cdpSession = await page.context().newCDPSession(page);
      const { windowId } = await cdpSession.send("Browser.getWindowForTarget");
      await cdpSession.send("Browser.setWindowBounds", { windowId, bounds: { windowState: "maximized" } });
      return true;
    } catch {
      return false;
    }
  }

  async bringToFront(page: Page, itemId: string): Promise<boolean> {
    try {
      if (page.isClosed()) return false;
      await this.restoreWindow(page, itemId);
      await new Promise((resolve) => setTimeout(resolve, 50));
      await this.maximizeWindow(page, itemId);
      await page.bringToFront();
      try {
        await page.evaluate(() => { window.focus(); document.body.click(); });
      } catch {}
      return true;
    } catch {
      return false;
    }
  }
}

export const cdpWindowController = new CDPWindowController();

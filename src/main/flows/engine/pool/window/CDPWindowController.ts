import type { Page } from "playwright";

/**
 * CDPWindowController - Handles Chrome DevTools Protocol window operations.
 * Used for minimizing, restoring, and focusing browser windows.
 */
export class CDPWindowController {
  /**
   * Minimize a browser window using CDP
   * @returns true if successful, false if operation failed
   */
  async minimizeWindow(page: Page, itemId: string): Promise<boolean> {
    try {
      if (page.isClosed()) {
        console.warn(`[CDP_CONTROLLER] Page is already closed for item ${itemId.substring(0, 8)}...`);
        return false;
      }

      console.log(`[CDP_CONTROLLER] Minimizing window for item ${itemId.substring(0, 8)}...`);

      const cdpSession = await page.context().newCDPSession(page);
      const { windowId } = await cdpSession.send("Browser.getWindowForTarget");

      await cdpSession.send("Browser.setWindowBounds", {
        windowId,
        bounds: { windowState: "minimized" },
      });

      console.log(`[CDP_CONTROLLER] Window minimized successfully`);
      return true;
    } catch (error) {
      console.error(`[CDP_CONTROLLER] Error minimizing window:`, error);
      return false;
    }
  }

  /**
   * Restore a window from minimized state using CDP
   * @returns true if successful, false if operation failed
   */
  async restoreWindow(page: Page, itemId: string): Promise<boolean> {
    try {
      if (page.isClosed()) {
        return false;
      }

      console.log(`[CDP_CONTROLLER] Restoring window for item ${itemId.substring(0, 8)}...`);

      const cdpSession = await page.context().newCDPSession(page);
      const { windowId } = await cdpSession.send("Browser.getWindowForTarget");

      await cdpSession.send("Browser.setWindowBounds", {
        windowId,
        bounds: { windowState: "normal" },
      });

      console.log(`[CDP_CONTROLLER] Window restored from minimized state`);
      return true;
    } catch (error) {
      console.warn(`[CDP_CONTROLLER] CDP restore failed (non-fatal):`, error);
      return false;
    }
  }

  /**
   * Maximize a window using CDP
   * @returns true if successful, false if operation failed
   */
  async maximizeWindow(page: Page, itemId: string): Promise<boolean> {
    try {
      if (page.isClosed()) {
        return false;
      }

      const cdpSession = await page.context().newCDPSession(page);
      const { windowId } = await cdpSession.send("Browser.getWindowForTarget");

      await cdpSession.send("Browser.setWindowBounds", {
        windowId,
        bounds: { windowState: "maximized" },
      });

      console.log(`[CDP_CONTROLLER] Window maximized`);
      return true;
    } catch (error) {
      console.warn(`[CDP_CONTROLLER] CDP maximize failed (non-fatal):`, error);
      return false;
    }
  }

  /**
   * Bring a window to foreground with multiple strategies
   * Uses: restore → maximize → bringToFront → focus
   * @returns true if successful, false if page is closed
   */
  async bringToFront(page: Page, itemId: string): Promise<boolean> {
    try {
      if (page.isClosed()) {
        console.warn(`[CDP_CONTROLLER] Page is already closed for item ${itemId.substring(0, 8)}...`);
        return false;
      }

      console.log(`[CDP_CONTROLLER] Bringing window to front for item ${itemId.substring(0, 8)}...`);

      // 1. Restore from minimized state
      await this.restoreWindow(page, itemId);

      // 2. Small delay to let the window manager process the state change
      await new Promise((resolve) => setTimeout(resolve, 50));

      // 3. Maximize the window (often forces focus on Linux)
      await this.maximizeWindow(page, itemId);

      // 4. Use Playwright's bringToFront
      await page.bringToFront();

      // 5. Try to focus the page content as well
      try {
        await page.evaluate(() => {
          window.focus();
          document.body.click();
        });
      } catch {
        // Ignore errors from evaluate
      }

      console.log(`[CDP_CONTROLLER] bringToFront completed`);
      return true;
    } catch (error) {
      console.error(`[CDP_CONTROLLER] Error bringing window to front:`, error);
      return false;
    }
  }
}

/** Singleton instance */
export const cdpWindowController = new CDPWindowController();

/**
 * WindowRegistry - Tracks browser windows for visible mode tasks
 * Used to bring windows to foreground when user wants manual takeover
 */

import type { Page } from "playwright";

export type WindowStatus = "active" | "waiting_user";

export type WindowEntry = {
  itemId: string;
  runId: string;
  flowKey: string;
  page: Page;
  status: WindowStatus;
  registeredAt: number;
};

class WindowRegistryImpl {
  private windows: Map<string, WindowEntry> = new Map();

  /**
   * Register a window for tracking
   */
  register(itemId: string, runId: string, flowKey: string, page: Page): void {
    console.log(`[WINDOW_REGISTRY] Registering window for item ${itemId.substring(0, 8)}...`);

    this.windows.set(itemId, {
      itemId,
      runId,
      flowKey,
      page,
      status: "active",
      registeredAt: Date.now(),
    });

    console.log(`[WINDOW_REGISTRY] Total registered windows: ${this.windows.size}`);
  }

  /**
   * Mark a window as waiting for user (manual takeover mode)
   */
  markWaitingUser(itemId: string): void {
    const entry = this.windows.get(itemId);
    if (entry) {
      console.log(`[WINDOW_REGISTRY] Marking item ${itemId.substring(0, 8)}... as waiting_user`);
      entry.status = "waiting_user";
    } else {
      console.warn(`[WINDOW_REGISTRY] Cannot mark waiting_user - item ${itemId.substring(0, 8)}... not found`);
    }
  }

  /**
   * Get a window entry by item ID
   */
  get(itemId: string): WindowEntry | undefined {
    return this.windows.get(itemId);
  }

  /**
   * Get all windows in waiting_user status
   */
  getWaitingUserWindows(): WindowEntry[] {
    return Array.from(this.windows.values()).filter((entry) => entry.status === "waiting_user");
  }

  /**
   * Get all windows for a specific run
   */
  getWindowsForRun(runId: string): WindowEntry[] {
    return Array.from(this.windows.values()).filter((entry) => entry.runId === runId);
  }

  /**
   * Remove a window from tracking
   */
  remove(itemId: string): void {
    const entry = this.windows.get(itemId);
    if (entry) {
      console.log(`[WINDOW_REGISTRY] Removing window for item ${itemId.substring(0, 8)}...`);
      this.windows.delete(itemId);
      console.log(`[WINDOW_REGISTRY] Total registered windows: ${this.windows.size}`);
    }
  }

  /**
   * Minimize a browser window using CDP
   * @returns true if successful, false if window not found or operation failed
   */
  async minimizeWindow(itemId: string): Promise<boolean> {
    const entry = this.windows.get(itemId);
    if (!entry) {
      console.warn(`[WINDOW_REGISTRY] Cannot minimize - item ${itemId.substring(0, 8)}... not found`);
      return false;
    }

    try {
      const page = entry.page;
      if (page.isClosed()) {
        console.warn(`[WINDOW_REGISTRY] Page is already closed for item ${itemId.substring(0, 8)}...`);
        return false;
      }

      console.log(`[WINDOW_REGISTRY] Minimizing window for item ${itemId.substring(0, 8)}...`);

      // Create CDP session and minimize
      const cdpSession = await page.context().newCDPSession(page);
      const { windowId } = await cdpSession.send("Browser.getWindowForTarget");

      await cdpSession.send("Browser.setWindowBounds", {
        windowId,
        bounds: { windowState: "minimized" },
      });

      console.log(`[WINDOW_REGISTRY] Window minimized successfully`);
      return true;
    } catch (error) {
      console.error(`[WINDOW_REGISTRY] Error minimizing window:`, error);
      return false;
    }
  }

  /**
   * Bring a window to the foreground
   * @returns true if successful, false if window not found or already closed
   */
  async bringToFront(itemId: string): Promise<boolean> {
    const entry = this.windows.get(itemId);
    if (!entry) {
      console.warn(`[WINDOW_REGISTRY] Cannot bring to front - item ${itemId.substring(0, 8)}... not found`);
      return false;
    }

    try {
      const page = entry.page;

      // Check if page is still open
      if (page.isClosed()) {
        console.warn(`[WINDOW_REGISTRY] Page is already closed for item ${itemId.substring(0, 8)}...`);
        this.remove(itemId);
        return false;
      }

      console.log(`[WINDOW_REGISTRY] Bringing window to front for item ${itemId.substring(0, 8)}...`);

      // Restore window from minimized state and activate using CDP
      try {
        const cdpSession = await page.context().newCDPSession(page);

        // 1. Restore from minimized state
        const { windowId } = await cdpSession.send("Browser.getWindowForTarget");
        await cdpSession.send("Browser.setWindowBounds", {
          windowId,
          bounds: { windowState: "normal" },
        });
        console.log(`[WINDOW_REGISTRY] Window restored from minimized state`);

        // 2. Small delay to let the window manager process the state change
        await new Promise((resolve) => setTimeout(resolve, 50));

        // 3. Try to maximize the window (this often forces focus on Linux)
        await cdpSession.send("Browser.setWindowBounds", {
          windowId,
          bounds: { windowState: "maximized" },
        });
        console.log(`[WINDOW_REGISTRY] Window maximized`);
      } catch (cdpError) {
        console.warn(`[WINDOW_REGISTRY] CDP restore failed (non-fatal):`, cdpError);
      }

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

      console.log(`[WINDOW_REGISTRY] bringToFront completed`);
      return true;
    } catch (error) {
      console.error(`[WINDOW_REGISTRY] Error bringing window to front:`, error);
      return false;
    }
  }

  /**
   * Check if a window exists and is still open
   */
  isAlive(itemId: string): boolean {
    const entry = this.windows.get(itemId);
    if (!entry) return false;
    return !entry.page.isClosed();
  }

  /**
   * Get count of registered windows
   */
  get size(): number {
    return this.windows.size;
  }

  /**
   * Clear all entries (used on shutdown)
   */
  clear(): void {
    console.log(`[WINDOW_REGISTRY] Clearing all ${this.windows.size} window entries`);
    this.windows.clear();
  }
}

// Singleton instance
export const windowRegistry = new WindowRegistryImpl();

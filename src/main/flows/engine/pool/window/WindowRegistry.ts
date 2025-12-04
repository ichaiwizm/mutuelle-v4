import type { Page } from "playwright";
import type { WindowEntry, WindowStatus } from "./types";
import { cdpWindowController } from "./CDPWindowController";

/**
 * WindowRegistry - Tracks browser windows for visible mode tasks.
 * Used to bring windows to foreground when user wants manual takeover.
 */
export class WindowRegistryImpl {
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
    return cdpWindowController.minimizeWindow(entry.page, itemId);
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

    if (entry.page.isClosed()) {
      this.remove(itemId);
      return false;
    }

    return cdpWindowController.bringToFront(entry.page, itemId);
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

/** Singleton instance */
export const windowRegistry = new WindowRegistryImpl();

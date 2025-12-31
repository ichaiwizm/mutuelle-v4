import type { Page } from "playwright";
import type { WindowEntry } from "./types";
import { cdpWindowController } from "./CDPWindowController";

export class WindowRegistryImpl {
  private windows: Map<string, WindowEntry> = new Map();

  register(itemId: string, runId: string, flowKey: string, page: Page): void {
    this.windows.set(itemId, { itemId, runId, flowKey, page, status: "active", registeredAt: Date.now() });
  }

  markWaitingUser(itemId: string): void {
    const entry = this.windows.get(itemId);
    if (entry) entry.status = "waiting_user";
  }

  get(itemId: string): WindowEntry | undefined {
    return this.windows.get(itemId);
  }

  getWaitingUserWindows(): WindowEntry[] {
    return Array.from(this.windows.values()).filter((e) => e.status === "waiting_user");
  }

  getWindowsForRun(runId: string): WindowEntry[] {
    return Array.from(this.windows.values()).filter((e) => e.runId === runId);
  }

  remove(itemId: string): void {
    this.windows.delete(itemId);
  }

  async minimizeWindow(itemId: string): Promise<boolean> {
    const entry = this.windows.get(itemId);
    if (!entry) return false;
    return cdpWindowController.minimizeWindow(entry.page, itemId);
  }

  async bringToFront(itemId: string): Promise<boolean> {
    const entry = this.windows.get(itemId);
    if (!entry) return false;
    if (entry.page.isClosed()) {
      this.remove(itemId);
      return false;
    }
    return cdpWindowController.bringToFront(entry.page, itemId);
  }

  isAlive(itemId: string): boolean {
    const entry = this.windows.get(itemId);
    return entry ? !entry.page.isClosed() : false;
  }

  get size(): number {
    return this.windows.size;
  }

  clear(): void {
    this.windows.clear();
  }
}

export const windowRegistry = new WindowRegistryImpl();

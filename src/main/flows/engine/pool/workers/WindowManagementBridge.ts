import type { Page } from "playwright";
import { windowRegistry } from "../window";
import type { OnManualCloseCallback } from "./types";

export class WindowManagementBridge {
  private taskId: string | null = null;
  private onManualCloseCallback: OnManualCloseCallback | null = null;
  private isWaitingUser = false;

  setOnManualClose(callback: OnManualCloseCallback): void { this.onManualCloseCallback = callback; }

  async register(taskId: string, runId: string, flowKey: string, page: Page): Promise<void> {
    this.taskId = taskId;
    windowRegistry.register(taskId, runId, flowKey, page);
    await windowRegistry.minimizeWindow(taskId);
  }

  setupPageCloseHandler(page: Page, taskId: string, onClose: () => void): void {
    page.on("close", () => this.handlePageClose(taskId, onClose));
  }

  async markWaitingUser(taskId: string): Promise<void> {
    this.isWaitingUser = true;
    windowRegistry.markWaitingUser(taskId);
    await windowRegistry.bringToFront(taskId);
  }

  get isWaitingForUser(): boolean { return this.isWaitingUser; }
  resetWaitingUser(): void { this.isWaitingUser = false; }

  removeFromRegistry(): void {
    if (this.taskId) {
      windowRegistry.remove(this.taskId);
      this.taskId = null;
    }
  }

  private handlePageClose(taskId: string, onStateReset: () => void): void {
    const entry = windowRegistry.get(taskId);
    if (!entry) return;

    if (entry.status === "waiting_user") {
      windowRegistry.remove(taskId);
      this.isWaitingUser = false;
      onStateReset();
      if (this.onManualCloseCallback) this.onManualCloseCallback(taskId);
    }
  }
}

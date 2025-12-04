import type { Page } from "playwright";
import { windowRegistry } from "../window";
import type { OnManualCloseCallback } from "./types";

/**
 * WindowManagementBridge - Handles WindowRegistry integration for visible mode.
 * Manages window registration, minimization, and bring-to-front operations.
 */
export class WindowManagementBridge {
  private taskId: string | null = null;
  private onManualCloseCallback: OnManualCloseCallback | null = null;
  private isWaitingUser = false;

  /**
   * Set callback for when user manually closes browser window.
   */
  setOnManualClose(callback: OnManualCloseCallback): void {
    this.onManualCloseCallback = callback;
  }

  /**
   * Register a page in the WindowRegistry for visible mode tracking.
   */
  async register(taskId: string, runId: string, flowKey: string, page: Page): Promise<void> {
    this.taskId = taskId;
    console.log(`[WINDOW_BRIDGE] Registering page in WindowRegistry...`);
    windowRegistry.register(taskId, runId, flowKey, page);

    // Minimize window immediately after registration
    await windowRegistry.minimizeWindow(taskId);
  }

  /**
   * Set up page close listener for manual takeover detection.
   */
  setupPageCloseHandler(page: Page, taskId: string, onClose: () => void): void {
    page.on("close", () => {
      this.handlePageClose(taskId, onClose);
    });
  }

  /**
   * Mark task as waiting for user (manual takeover mode).
   */
  async markWaitingUser(taskId: string): Promise<void> {
    this.isWaitingUser = true;
    windowRegistry.markWaitingUser(taskId);
    // Bring window to front for user to see
    await windowRegistry.bringToFront(taskId);
  }

  /**
   * Check if in waiting_user state.
   */
  get isWaitingForUser(): boolean {
    return this.isWaitingUser;
  }

  /**
   * Reset waiting_user state.
   */
  resetWaitingUser(): void {
    this.isWaitingUser = false;
  }

  /**
   * Remove from WindowRegistry if registered.
   */
  removeFromRegistry(): void {
    if (this.taskId) {
      windowRegistry.remove(this.taskId);
      this.taskId = null;
    }
  }

  /**
   * Handle page close event (user closed browser window).
   */
  private handlePageClose(taskId: string, onStateReset: () => void): void {
    console.log(`[WINDOW_BRIDGE] handlePageClose() called for task ${taskId.substring(0, 8)}...`);

    const entry = windowRegistry.get(taskId);
    if (!entry) {
      console.log(`[WINDOW_BRIDGE] Task not in WindowRegistry, ignoring page close`);
      return;
    }

    // Only trigger callback if in waiting_user state
    if (entry.status === "waiting_user") {
      console.log(`[WINDOW_BRIDGE] User closed browser in waiting_user state - marking as manual complete`);

      // Remove from registry
      windowRegistry.remove(taskId);

      // Reset state
      this.isWaitingUser = false;
      onStateReset();

      // Notify callback
      if (this.onManualCloseCallback) {
        this.onManualCloseCallback(taskId);
      }
    } else {
      console.log(`[WINDOW_BRIDGE] Page closed but not in waiting_user state (status: ${entry.status})`);
    }
  }
}

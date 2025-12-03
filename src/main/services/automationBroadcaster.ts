/**
 * AutomationBroadcaster - Broadcasts automation progress events to all renderer processes
 */

import { BrowserWindow } from "electron";
import type { AutomationProgressEvent } from "@/shared/types/step-progress";

const CHANNEL = "automation:progress";

class AutomationBroadcasterImpl {
  private subscribers = new Set<number>(); // webContents IDs

  /**
   * Broadcast an event to all renderer windows
   */
  broadcast(event: AutomationProgressEvent): void {
    console.log(`[BROADCASTER] Broadcasting event: ${event.type}`);
    const broadcastStart = Date.now();

    const windows = BrowserWindow.getAllWindows();
    console.log(`[BROADCASTER] Found ${windows.length} windows`);

    let sentCount = 0;
    for (const win of windows) {
      if (!win.isDestroyed() && win.webContents) {
        win.webContents.send(CHANNEL, event);
        sentCount++;
      }
    }

    console.log(`[BROADCASTER] Sent to ${sentCount} windows in ${Date.now() - broadcastStart}ms`);
  }

  /**
   * Emit run started event
   */
  runStarted(runId: string, itemCount: number): void {
    this.broadcast({ type: "run:started", runId, itemCount });
  }

  /**
   * Emit run completed event
   */
  runCompleted(runId: string, success: boolean): void {
    this.broadcast({ type: "run:completed", runId, success });
  }

  /**
   * Emit item started event with step definitions
   */
  itemStarted(
    runId: string,
    itemId: string,
    flowKey: string,
    leadId: string,
    steps: Array<{ id: string; name: string }>
  ): void {
    this.broadcast({
      type: "item:started",
      runId,
      itemId,
      flowKey,
      leadId,
      steps: steps.map((s) => ({
        id: s.id,
        name: s.name,
        status: "pending" as const,
      })),
    });
  }

  /**
   * Emit step started event
   */
  stepStarted(runId: string, itemId: string, stepId: string, stepIndex: number): void {
    this.broadcast({
      type: "item:step:started",
      runId,
      itemId,
      stepId,
      stepIndex,
    });
  }

  /**
   * Emit step completed event
   */
  stepCompleted(
    runId: string,
    itemId: string,
    stepId: string,
    stepIndex: number,
    duration: number,
    screenshot?: string
  ): void {
    this.broadcast({
      type: "item:step:completed",
      runId,
      itemId,
      stepId,
      stepIndex,
      duration,
      screenshot,
    });
  }

  /**
   * Emit step failed event
   */
  stepFailed(
    runId: string,
    itemId: string,
    stepId: string,
    stepIndex: number,
    error: string,
    screenshot?: string
  ): void {
    this.broadcast({
      type: "item:step:failed",
      runId,
      itemId,
      stepId,
      stepIndex,
      error,
      screenshot,
    });
  }

  /**
   * Emit step skipped event
   */
  stepSkipped(
    runId: string,
    itemId: string,
    stepId: string,
    stepIndex: number,
    reason: string
  ): void {
    this.broadcast({
      type: "item:step:skipped",
      runId,
      itemId,
      stepId,
      stepIndex,
      reason,
    });
  }

  /**
   * Emit item completed event
   */
  itemCompleted(runId: string, itemId: string, success: boolean, duration: number): void {
    this.broadcast({
      type: "item:completed",
      runId,
      itemId,
      success,
      duration,
    });
  }

  /**
   * Emit item failed event
   */
  itemFailed(runId: string, itemId: string, error: string): void {
    this.broadcast({
      type: "item:failed",
      runId,
      itemId,
      error,
    });
  }

  /**
   * Emit run cancelled event
   */
  runCancelled(runId: string): void {
    this.broadcast({ type: "run:cancelled", runId });
  }

  /**
   * Emit item cancelled event
   */
  itemCancelled(runId: string, itemId: string): void {
    this.broadcast({ type: "item:cancelled", runId, itemId });
  }

  /**
   * Emit item waiting for user event (manual takeover mode)
   */
  itemWaitingUser(runId: string, itemId: string, stoppedAtStep: string): void {
    this.broadcast({ type: "item:waiting_user", runId, itemId, stoppedAtStep });
  }
}

// Singleton instance
export const AutomationBroadcaster = new AutomationBroadcasterImpl();

import type { BrowserContext } from "playwright";
import type { FlowTask, WorkerStatus } from "../types";
import type { FlowExecutionResult } from "../../types";
import { FlowEngine } from "../../FlowEngine";
import { PageLifecycleManager } from "./PageLifecycleManager";
import { WindowManagementBridge } from "./WindowManagementBridge";
import { createAbortedResult, type OnManualCloseCallback } from "./types";

/**
 * A worker that executes a single flow within its own isolated browser context.
 * Each worker creates its own page from the context and manages its lifecycle.
 */
export class FlowWorker {
  private id: string;
  private pageManager: PageLifecycleManager;
  private windowBridge: WindowManagementBridge;
  private engine: FlowEngine | null = null;
  private _status: WorkerStatus = "idle";
  private isAborted = false;

  constructor(id: string, context: BrowserContext) {
    this.id = id;
    this.pageManager = new PageLifecycleManager(context);
    this.windowBridge = new WindowManagementBridge();
  }

  /** Set callback for when user manually closes browser window */
  setOnManualClose(callback: OnManualCloseCallback): void {
    this.windowBridge.setOnManualClose(callback);
  }

  /** Get the current status of the worker */
  get status(): WorkerStatus {
    return this._status;
  }

  /** Get the worker ID */
  get workerId(): string {
    return this.id;
  }

  /** Check if worker is in waiting_user state */
  get isWaitingForUser(): boolean {
    return this.windowBridge.isWaitingForUser;
  }

  /** Execute a flow task */
  async execute(task: FlowTask, abortSignal?: AbortSignal): Promise<FlowExecutionResult> {
    const workerId = this.id.substring(0, 8);
    const isVisibleMode = task.automationSettings?.headless === false;

    console.log(`\n[FLOW_WORKER] ========== EXECUTE START ==========`);
    console.log(`[FLOW_WORKER] Worker ID: ${workerId}...`);
    console.log(`[FLOW_WORKER] Flow: ${task.flowKey}`);
    console.log(`[FLOW_WORKER] Lead ID: ${task.leadId?.substring(0, 8)}...`);
    console.log(`[FLOW_WORKER] Visible mode: ${isVisibleMode}`);
    console.log(`[FLOW_WORKER] Auto submit: ${task.automationSettings?.autoSubmit ?? true}`);

    this._status = "running";
    this.isAborted = false;
    this.windowBridge.resetWaitingUser();

    // Listen for abort signal
    if (abortSignal) {
      console.log(`[FLOW_WORKER] Registering abort signal listener`);
      abortSignal.addEventListener("abort", () => this.abort(), { once: true });
    }

    try {
      // Check if already aborted before starting
      if (abortSignal?.aborted || this.isAborted) {
        console.log(`[FLOW_WORKER] Already aborted, returning early`);
        return createAbortedResult(task);
      }

      // Create a new page for this flow
      const page = await this.pageManager.createPage(this.id);

      // Register in WindowRegistry if visible mode
      if (isVisibleMode && task.runId) {
        await this.windowBridge.register(task.id, task.runId, task.flowKey, page);
        this.windowBridge.setupPageCloseHandler(page, task.id, () => {
          this.pageManager.markPageClosed();
          this.engine = null;
          this._status = "idle";
        });
      }

      // Create a FlowEngine with the task's config
      console.log(`[FLOW_WORKER] Creating FlowEngine instance...`);
      this.engine = new FlowEngine({
        stopOnError: true,
        ...task.flowConfig,
      });

      // Execute the flow
      console.log(`[FLOW_WORKER] Calling engine.execute()...`);
      const executeStart = Date.now();

      const result = await this.engine.execute(task.flowKey, {
        page,
        lead: task.lead,
        transformedData: task.transformedData,
        artifactsDir: task.artifactsDir,
      });

      console.log(`[FLOW_WORKER] engine.execute() completed in ${Date.now() - executeStart}ms`);
      console.log(`[FLOW_WORKER] Result success: ${result.success}`);
      console.log(`[FLOW_WORKER] Result waitingUser: ${result.waitingUser ?? false}`);

      // Check if aborted during execution
      if (this.isAborted) {
        console.log(`[FLOW_WORKER] Aborted during execution`);
        return createAbortedResult(task);
      }

      // Handle waiting_user state - DON'T cleanup, keep page open
      if (result.waitingUser) {
        console.log(`[FLOW_WORKER] Entering waiting_user state - keeping page open for manual takeover`);
        this._status = "completed";
        await this.windowBridge.markWaitingUser(task.id);
        console.log(`[FLOW_WORKER] ========== WAITING USER ==========\n`);
        return result;
      }

      this._status = result.success ? "completed" : "error";
      console.log(`[FLOW_WORKER] Final status: ${this._status}`);
      console.log(`[FLOW_WORKER] ========== EXECUTE END ==========\n`);
      return result;
    } catch (error) {
      console.error(`[FLOW_WORKER] EXCEPTION in execute():`, error);

      if (this.isAborted) {
        return createAbortedResult(task);
      }

      this._status = "error";
      this.logError(error, task);

      return {
        success: false,
        flowKey: task.flowKey,
        leadId: task.leadId,
        steps: [],
        totalDuration: 0,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /** Request pause on the current flow execution */
  requestPause(): void {
    if (this.engine && this._status === "running") {
      this.engine.requestPause();
    }
  }

  /** Clean up resources (close page) */
  async cleanup(): Promise<void> {
    console.log(`[FLOW_WORKER] cleanup() called for worker ${this.id.substring(0, 8)}...`);

    // Don't cleanup if in waiting_user state - page should stay open
    if (this.windowBridge.isWaitingForUser) {
      console.log(`[FLOW_WORKER] In waiting_user state, skipping cleanup (page stays open)`);
      return;
    }

    this.windowBridge.removeFromRegistry();
    await this.pageManager.closePage(this.id);
    this.engine = null;
    this._status = "idle";
    console.log(`[FLOW_WORKER] cleanup() done`);
  }

  /** Abort the current flow execution immediately */
  async abort(): Promise<void> {
    if (this.isAborted) return;
    this.isAborted = true;

    if (this.engine) {
      this.engine.requestAbort();
    }

    // Force cleanup even if in waiting_user state
    this.windowBridge.resetWaitingUser();
    await this.cleanup();
  }

  private logError(error: unknown, task: FlowTask): void {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.log("\n========================================");
    console.log("FLOW WORKER ERROR");
    console.log("========================================");
    console.log(`Flow: ${task.flowKey}`);
    console.log(`Lead ID: ${task.leadId?.substring(0, 8)}...`);
    console.log(`Error: ${errorMsg}`);
    if (errorStack) {
      console.log("\nStack trace:");
      console.log(errorStack);
    }
    console.log("========================================\n");
  }
}

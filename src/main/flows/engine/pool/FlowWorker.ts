import type { BrowserContext, Page } from "playwright";
import type { FlowTask, WorkerStatus } from "./types";
import type { FlowExecutionResult } from "../types";
import { FlowEngine } from "../FlowEngine";
import { windowRegistry } from "./WindowRegistry";

/**
 * Callback for when user manually closes the browser window
 */
export type OnManualCloseCallback = (taskId: string) => void;

/**
 * A worker that executes a single flow within its own isolated browser context.
 * Each worker creates its own page from the context and manages its lifecycle.
 */
export class FlowWorker {
  private id: string;
  private context: BrowserContext;
  private page: Page | null = null;
  private engine: FlowEngine | null = null;
  private _status: WorkerStatus = "idle";
  private isAborted = false;
  private isWaitingUser = false;
  private currentTaskId: string | null = null;
  private onManualCloseCallback: OnManualCloseCallback | null = null;

  constructor(id: string, context: BrowserContext) {
    this.id = id;
    this.context = context;
  }

  /**
   * Set callback for when user manually closes browser window while in waiting_user state
   */
  setOnManualClose(callback: OnManualCloseCallback): void {
    this.onManualCloseCallback = callback;
  }

  /**
   * Get the current status of the worker.
   */
  get status(): WorkerStatus {
    return this._status;
  }

  /**
   * Get the worker ID.
   */
  get workerId(): string {
    return this.id;
  }

  /**
   * Execute a flow task.
   * Creates a page, runs the flow, and returns the result.
   */
  async execute(task: FlowTask, abortSignal?: AbortSignal): Promise<FlowExecutionResult> {
    const workerId = this.id.substring(0, 8);
    const isVisibleMode = task.automationSettings?.headless === false;

    console.log(`\n[FLOW_WORKER] ========== EXECUTE START ==========`);
    console.log(`[FLOW_WORKER] Worker ID: ${workerId}...`);
    console.log(`[FLOW_WORKER] Flow: ${task.flowKey}`);
    console.log(`[FLOW_WORKER] Lead ID: ${task.leadId?.substring(0, 8)}...`);
    console.log(`[FLOW_WORKER] Visible mode: ${isVisibleMode}`);
    console.log(`[FLOW_WORKER] Stop at step: ${task.automationSettings?.stopAtStep ?? 'none'}`);

    this._status = "running";
    this.isAborted = false;
    this.isWaitingUser = false;
    this.currentTaskId = task.id;

    // Listen for abort signal
    if (abortSignal) {
      console.log(`[FLOW_WORKER] Registering abort signal listener`);
      abortSignal.addEventListener("abort", () => this.abort(), { once: true });
    }

    try {
      // Check if already aborted before starting
      console.log(`[FLOW_WORKER] Checking abort status...`);
      console.log(`[FLOW_WORKER] abortSignal?.aborted: ${abortSignal?.aborted}`);
      console.log(`[FLOW_WORKER] this.isAborted: ${this.isAborted}`);

      if (abortSignal?.aborted || this.isAborted) {
        console.log(`[FLOW_WORKER] Already aborted, returning early`);
        return this.createAbortedResult(task);
      }

      // Create a new page for this flow
      console.log(`[FLOW_WORKER] Creating new page from context...`);
      const pageStart = Date.now();
      this.page = await this.context.newPage();
      console.log(`[FLOW_WORKER] Page created in ${Date.now() - pageStart}ms`);

      // Register in WindowRegistry if visible mode
      if (isVisibleMode && task.runId) {
        console.log(`[FLOW_WORKER] Registering page in WindowRegistry...`);
        windowRegistry.register(task.id, task.runId, task.flowKey, this.page);

        // Set up page close listener for manual takeover detection
        this.page.on("close", () => {
          this.handlePageClose(task.id);
        });
      }

      // Create a FlowEngine with the task's config
      console.log(`[FLOW_WORKER] Creating FlowEngine instance...`);
      console.log(`[FLOW_WORKER] Task config: ${JSON.stringify(task.flowConfig || {})}`);
      this.engine = new FlowEngine({
        stopOnError: true,
        ...task.flowConfig,
      });
      console.log(`[FLOW_WORKER] FlowEngine created`);

      // Execute the flow
      console.log(`[FLOW_WORKER] Calling engine.execute()...`);
      console.log(`[FLOW_WORKER] FlowKey: ${task.flowKey}`);
      console.log(`[FLOW_WORKER] ArtifactsDir: ${task.artifactsDir}`);
      const executeStart = Date.now();

      const result = await this.engine.execute(task.flowKey, {
        page: this.page,
        lead: task.lead,
        transformedData: task.transformedData,
        artifactsDir: task.artifactsDir,
      });

      console.log(`[FLOW_WORKER] engine.execute() completed in ${Date.now() - executeStart}ms`);
      console.log(`[FLOW_WORKER] Result success: ${result.success}`);
      console.log(`[FLOW_WORKER] Result steps: ${result.steps?.length || 0}`);
      console.log(`[FLOW_WORKER] Result waitingUser: ${result.waitingUser ?? false}`);

      // Check if aborted during execution
      if (this.isAborted) {
        console.log(`[FLOW_WORKER] Aborted during execution`);
        return this.createAbortedResult(task);
      }

      // Handle waiting_user state - DON'T cleanup, keep page open
      if (result.waitingUser) {
        console.log(`[FLOW_WORKER] Entering waiting_user state - keeping page open for manual takeover`);
        this.isWaitingUser = true;
        this._status = "completed"; // Worker is "done" but page stays open
        windowRegistry.markWaitingUser(task.id);
        console.log(`[FLOW_WORKER] ========== WAITING USER ==========\n`);
        return result;
      }

      this._status = result.success ? "completed" : "error";
      console.log(`[FLOW_WORKER] Final status: ${this._status}`);
      console.log(`[FLOW_WORKER] ========== EXECUTE END ==========\n`);
      return result;
    } catch (error) {
      console.error(`[FLOW_WORKER] EXCEPTION in execute():`, error);

      // Check if this was an abort
      if (this.isAborted) {
        console.log(`[FLOW_WORKER] Exception was due to abort`);
        return this.createAbortedResult(task);
      }

      this._status = "error";

      // Log the error that prevented flow execution
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

      // Return a failed result
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

  private createAbortedResult(task: FlowTask): FlowExecutionResult {
    return {
      success: false,
      flowKey: task.flowKey,
      leadId: task.leadId,
      steps: [],
      totalDuration: 0,
      error: new Error("Flow aborted"),
      aborted: true,
    };
  }

  /**
   * Request pause on the current flow execution.
   */
  requestPause(): void {
    if (this.engine && this._status === "running") {
      this.engine.requestPause();
    }
  }

  /**
   * Clean up resources (close page).
   * The context is managed by BrowserManager and should be closed there.
   */
  async cleanup(): Promise<void> {
    console.log(`[FLOW_WORKER] cleanup() called for worker ${this.id.substring(0, 8)}...`);

    // Don't cleanup if in waiting_user state - page should stay open
    if (this.isWaitingUser) {
      console.log(`[FLOW_WORKER] In waiting_user state, skipping cleanup (page stays open)`);
      return;
    }

    // Remove from WindowRegistry if registered
    if (this.currentTaskId) {
      windowRegistry.remove(this.currentTaskId);
    }

    if (this.page) {
      try {
        console.log(`[FLOW_WORKER] Closing page...`);
        await this.page.close();
        console.log(`[FLOW_WORKER] Page closed`);
      } catch (error) {
        console.warn(`[FLOW_WORKER] Error closing page:`, error);
        // Ignore errors during cleanup
      }
      this.page = null;
    } else {
      console.log(`[FLOW_WORKER] No page to close`);
    }
    this.engine = null;
    this._status = "idle";
    this.currentTaskId = null;
    console.log(`[FLOW_WORKER] cleanup() done`);
  }

  /**
   * Handle page close event (user closed browser window).
   * Called when page is closed externally (e.g., user closes browser window).
   */
  private handlePageClose(taskId: string): void {
    console.log(`[FLOW_WORKER] handlePageClose() called for task ${taskId.substring(0, 8)}...`);

    const entry = windowRegistry.get(taskId);
    if (!entry) {
      console.log(`[FLOW_WORKER] Task not in WindowRegistry, ignoring page close`);
      return;
    }

    // Only trigger callback if in waiting_user state
    if (entry.status === "waiting_user") {
      console.log(`[FLOW_WORKER] User closed browser in waiting_user state - marking as manual complete`);

      // Remove from registry
      windowRegistry.remove(taskId);

      // Reset state
      this.isWaitingUser = false;
      this.page = null; // Page is already closed
      this.engine = null;
      this._status = "idle";

      // Notify callback
      if (this.onManualCloseCallback) {
        this.onManualCloseCallback(taskId);
      }
    } else {
      console.log(`[FLOW_WORKER] Page closed but not in waiting_user state (status: ${entry.status})`);
    }
  }

  /**
   * Abort the current flow execution immediately.
   */
  async abort(): Promise<void> {
    if (this.isAborted) return;
    this.isAborted = true;

    // Signal the engine to abort
    if (this.engine) {
      this.engine.requestAbort();
    }

    // Force cleanup even if in waiting_user state
    this.isWaitingUser = false;
    await this.cleanup();
  }

  /**
   * Check if worker is in waiting_user state
   */
  get isWaitingForUser(): boolean {
    return this.isWaitingUser;
  }
}

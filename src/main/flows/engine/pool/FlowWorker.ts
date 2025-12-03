import type { BrowserContext, Page } from "playwright";
import type { FlowTask, WorkerStatus } from "./types";
import type { FlowExecutionResult } from "../types";
import { FlowEngine } from "../FlowEngine";

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

  constructor(id: string, context: BrowserContext) {
    this.id = id;
    this.context = context;
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
    console.log(`\n[FLOW_WORKER] ========== EXECUTE START ==========`);
    console.log(`[FLOW_WORKER] Worker ID: ${workerId}...`);
    console.log(`[FLOW_WORKER] Flow: ${task.flowKey}`);
    console.log(`[FLOW_WORKER] Lead ID: ${task.leadId?.substring(0, 8)}...`);

    this._status = "running";
    this.isAborted = false;

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

      // Check if aborted during execution
      if (this.isAborted) {
        console.log(`[FLOW_WORKER] Aborted during execution`);
        return this.createAbortedResult(task);
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
    console.log(`[FLOW_WORKER] cleanup() done`);
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

    // Clean up resources
    await this.cleanup();
  }
}

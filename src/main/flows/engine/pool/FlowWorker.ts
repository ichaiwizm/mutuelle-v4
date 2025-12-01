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
  async execute(task: FlowTask): Promise<FlowExecutionResult> {
    this._status = "running";

    try {
      // Create a new page for this flow
      this.page = await this.context.newPage();

      // Create a FlowEngine with the task's config
      this.engine = new FlowEngine({
        stopOnError: true,
        ...task.flowConfig,
      });

      // Execute the flow
      const result = await this.engine.execute(task.flowKey, {
        page: this.page,
        lead: task.lead,
        transformedData: task.transformedData,
        artifactsDir: task.artifactsDir,
      });

      this._status = result.success ? "completed" : "error";
      return result;
    } catch (error) {
      this._status = "error";

      // Log the error that prevented flow execution
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      console.log('\n========================================');
      console.log('FLOW WORKER ERROR');
      console.log('========================================');
      console.log(`Flow: ${task.flowKey}`);
      console.log(`Lead ID: ${task.leadId?.substring(0, 8)}...`);
      console.log(`Error: ${errorMsg}`);
      if (errorStack) {
        console.log('\nStack trace:');
        console.log(errorStack);
      }
      console.log('========================================\n');

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
    if (this.page) {
      try {
        await this.page.close();
      } catch {
        // Ignore errors during cleanup
      }
      this.page = null;
    }
    this.engine = null;
    this._status = "idle";
  }
}

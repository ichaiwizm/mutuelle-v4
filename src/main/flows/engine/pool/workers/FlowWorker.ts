import type { BrowserContext } from "playwright";
import type { FlowTask, WorkerStatus } from "../types";
import type { FlowExecutionResult } from "../../types";
import type { FlowResult } from "@mutuelle/engine";
import { YamlEngineAdapter } from "../../yaml-engine-adapter";
import { PageLifecycleManager } from "./PageLifecycleManager";
import { WindowManagementBridge } from "./WindowManagementBridge";
import { createAbortedResult, type OnManualCloseCallback } from "./types";
import { captureException } from "../../../../services/monitoring";

/** Worker that executes flows in an isolated browser context using YamlFlowEngine */
export class FlowWorker {
  private pageManager: PageLifecycleManager;
  private windowBridge = new WindowManagementBridge();
  private engineAdapter: YamlEngineAdapter | null = null;
  private _status: WorkerStatus = "idle";
  private isAborted = false;

  constructor(readonly workerId: string, ctx: BrowserContext) { this.pageManager = new PageLifecycleManager(ctx); }
  get status(): WorkerStatus { return this._status; }
  get isWaitingForUser(): boolean { return this.windowBridge.isWaitingForUser; }
  setOnManualClose(cb: OnManualCloseCallback): void { this.windowBridge.setOnManualClose(cb); }

  async execute(task: FlowTask, abortSignal?: AbortSignal): Promise<FlowExecutionResult> {
    this._status = "running";
    this.isAborted = false;
    this.windowBridge.resetWaitingUser();
    abortSignal?.addEventListener("abort", () => this.abort(), { once: true });
    try {
      if (abortSignal?.aborted || this.isAborted) return createAbortedResult(task);
      const page = await this.pageManager.createPage(this.workerId);
      if (task.automationSettings?.headless === false && task.runId) {
        await this.windowBridge.register(task.id, task.runId, task.flowKey, page);
        this.windowBridge.setupPageCloseHandler(page, task.id, () => {
          this.pageManager.markPageClosed();
          this.engineAdapter = null;
          this._status = "idle";
        });
      }
      this.engineAdapter = new YamlEngineAdapter();
      const flowResult = await this.engineAdapter.execute(task.flowKey, {
        page,
        lead: (task.transformedData ?? task.lead) as Record<string, unknown>,
        platform: task.flowKey.match(/^(alptis|swisslife|entoria)_/)?.[1],
        metadata: { artifactsDir: task.artifactsDir, autoSubmit: task.automationSettings?.autoSubmit },
      });
      if (this.isAborted) return createAbortedResult(task);
      const result = this.toResult(flowResult, task);
      if (result.waitingUser) {
        this._status = "completed";
        await this.windowBridge.markWaitingUser(task.id);
        return result;
      }
      this._status = result.success ? "completed" : "error";
      return result;
    } catch (error) {
      if (this.isAborted) return createAbortedResult(task);
      this._status = "error";
      const err = error instanceof Error ? error : new Error(String(error));
      captureException(err, { tags: { flowKey: task.flowKey }, extra: { leadId: task.leadId } });
      return { success: false, flowKey: task.flowKey, leadId: task.leadId, steps: [], totalDuration: 0, error: err };
    }
  }

  private toResult(r: FlowResult, task: FlowTask): FlowExecutionResult {
    const success = r.status === "completed", isPaused = r.status === "pending" && r.stepResults.length > 0;
    return {
      success, flowKey: task.flowKey, leadId: task.leadId, totalDuration: r.durationMs,
      steps: r.stepResults.map(s => ({
        success: s.status === "completed", stepId: s.stepId, duration: s.durationMs ?? 0,
        retries: s.retryCount ?? 0, error: s.error, metadata: s.extracted ? { extracted: s.extracted } : undefined,
      })),
      error: r.error ? new Error(r.error.message) : undefined, paused: isPaused, stateId: r.executionId,
      waitingUser: isPaused, stoppedAtStep: isPaused ? r.stepResults.at(-1)?.stepId : undefined,
    };
  }

  requestPause(): void { if (this.engineAdapter && this._status === "running") this.engineAdapter.pause(); }

  async cleanup(): Promise<void> {
    if (this.windowBridge.isWaitingForUser) return;
    this.windowBridge.removeFromRegistry();
    await this.pageManager.closePage(this.workerId);
    this.engineAdapter = null;
    this._status = "idle";
  }

  async abort(): Promise<void> {
    if (this.isAborted) return;
    this.isAborted = true;
    this.engineAdapter?.pause();
    this.windowBridge.resetWaitingUser();
    await this.cleanup();
  }
}

import { EventEmitter } from "events";
import type { ProductConfiguration } from "../../../shared/types/product";
import type { ExecutionContext, FlowExecutionConfig, FlowExecutionResult, FlowHooks, FlowState, StepResult } from "./types";
import { StepRegistry } from "./StepRegistry";
import { FlowLogger } from "./FlowLogger";
import { getProductConfig } from "../../services/productConfig/productConfigCore";
import { getEnvironment, getAlptisEnvironmentBehaviors } from "../config/alptis.config";
import { flowStateService } from "../state";
import { executeStepWithRetry, evaluateConditional, captureScreenshot, buildFlowResult } from "./core";
import { HooksManager } from "./hooks";
import { PauseResumeManager } from "./pause";
import { getServicesForFlow } from "./services";
import { captureException, trackFlowStart, trackFlowStep, trackFlowComplete } from "../../services/monitoring";

/**
 * Main Flow Execution Engine
 */
export class FlowEngine extends EventEmitter {
  private registry = StepRegistry.getInstance();
  private config: FlowExecutionConfig;
  private hooks: FlowHooks;
  private hooksManager: HooksManager;
  private pauseManager: PauseResumeManager;
  private abortRequested = false;

  constructor(config?: FlowExecutionConfig) {
    super();
    const env = getEnvironment();
    const envBehaviors = getAlptisEnvironmentBehaviors(env);

    this.config = { stopOnError: true, ...envBehaviors, ...config };
    this.hooks = config?.hooks ?? {};
    this.hooksManager = new HooksManager(this.hooks, this);
    this.pauseManager = new PauseResumeManager(
      { enabled: !!this.config.enablePauseResume, stateId: this.config.stateId },
      flowStateService
    );
  }

  async execute<T = any>(flowKey: string, context: Omit<ExecutionContext<T>, "stepDefinition" | "flowKey" | "logger" | "services">): Promise<FlowExecutionResult> {
    const startTime = Date.now();
    const stepResults: StepResult[] = [];
    this.pauseManager.reset();

    const logger = new FlowLogger(flowKey, context.lead?.id, this.config.verbose);
    const services = await getServicesForFlow(flowKey);
    const baseContext = { ...context, flowKey, logger, services } as ExecutionContext<T>;

    try {
      const productConfig = getProductConfig(flowKey) as ProductConfiguration<T> | undefined;
      if (!productConfig) {
        throw new Error(`Product configuration not found: ${flowKey}`);
      }

      // Validate all step classes exist in registry before starting
      for (const stepDef of productConfig.steps) {
        if (stepDef.stepClass && !this.registry.has(stepDef.stepClass)) {
          throw new Error(`Step class "${stepDef.stepClass}" not found in registry for step "${stepDef.id}"`);
        }
      }

      const startIndex = await this.pauseManager.initialize(flowKey, context.lead?.id, logger);
      if (this.config.stateId) await this.hooksManager.flowResumed(flowKey, context.lead?.id, this.pauseManager.state?.id);

      logger.info(`Starting flow: ${flowKey} (${productConfig.steps.length} steps)${this.config.stateId ? ` - resuming from state ${this.config.stateId}` : ''}`);

      await this.hooksManager.flowStart(flowKey, context.lead?.id, this.pauseManager.state?.id);
      await this.hooksManager.beforeFlow(baseContext);

      // Sentry tracking
      trackFlowStart(flowKey, context.lead?.id ? parseInt(context.lead.id, 10) : 0, this.pauseManager.state?.id ?? "no-state");

      for (let i = startIndex; i < productConfig.steps.length; i++) {
        // Check for abort before each step
        if (this.abortRequested) {
          throw new Error("Flow aborted");
        }

        const stepDef = productConfig.steps[i];
        const stepCtx: ExecutionContext<T> = { ...context, flowKey, stepDefinition: stepDef, logger: logger.child({ stepId: stepDef.id }), services };

        if (this.pauseManager.isPauseRequested) {
          await this.pauseManager.markPaused();
          await this.hooksManager.flowPaused(flowKey, context.lead?.id, this.pauseManager.state?.id);
          return buildFlowResult({ flowKey, leadId: context.lead?.id, steps: stepResults, startTime, stateId: this.pauseManager.state?.id, paused: true });
        }

        const skipReason = this.getSkipReason(stepDef, context.transformedData, productConfig, logger);
        if (skipReason) { await this.hooksManager.stepSkip(flowKey, stepDef, skipReason, stepCtx); continue; }

        // Check if we should stop BEFORE this submit step for manual takeover
        // autoSubmit: false (or undefined when explicitly disabled) means user wants to take over before final submission
        if (this.config.autoSubmit === false && stepDef.isSubmit === true) {
          logger.info(`Stopping before submit step "${stepDef.id}" - waiting for user manual takeover`);
          return buildFlowResult({
            flowKey,
            leadId: context.lead?.id,
            steps: stepResults,
            startTime,
            stateId: this.pauseManager.state?.id,
            waitingUser: true,
            stoppedAtStep: stepResults[stepResults.length - 1]?.stepId,
          });
        }

        await this.hooksManager.stepStart(flowKey, stepDef, stepCtx);
        const result = await executeStepWithRetry(stepDef, stepCtx, { registry: this.registry, hooks: this.hooks, emitter: this });
        stepResults.push(result);

        // Capture screenshot BEFORE afterStep hook so it's included in the broadcast
        if (context.page) {
          const shouldCapture = result.success ? this.config.screenshotOnSuccess : this.config.screenshotOnError;
          if (shouldCapture) {
            const screenshotPath = await captureScreenshot({
              page: context.page,
              artifactsDir: context.artifactsDir,
              stepId: stepDef.id,
              type: result.success ? "success" : "error",
              logger: stepCtx.logger!,
            });
            if (screenshotPath) {
              result.metadata = { ...result.metadata, screenshotPath };
            }
          }
        }

        await this.hooksManager.afterStep(stepCtx, stepDef, result);

        if (!result.success) {
          await this.handleStepError(flowKey, stepDef, result, stepCtx);
          if (this.config.stopOnError) throw result.error || new Error(`Step ${stepDef.id} failed`);
        } else {
          await this.handleStepSuccess(flowKey, stepDef, result, i);
        }
      }

      await this.pauseManager.markCompleted();
      const finalResult = buildFlowResult({ flowKey, leadId: context.lead?.id, steps: stepResults, startTime, stateId: this.pauseManager.state?.id });

      logger.info(`Flow completed: ${stepResults.length} steps, ${stepResults.filter(s => s.success).length} successful, ${finalResult.totalDuration}ms`);

      trackFlowComplete(flowKey, this.pauseManager.state?.id ?? "no-state", true);
      await this.hooksManager.flowComplete(flowKey, finalResult, baseContext);
      return finalResult;
    } catch (error) {
      await this.pauseManager.markFailed();
      const errorObj = error instanceof Error ? error : new Error(String(error));

      const lastStepInfo = stepResults.length > 0
        ? ` (last step: ${stepResults[stepResults.length - 1].stepId})`
        : '';
      logger.error(`Flow failed after ${stepResults.length} steps${lastStepInfo}: ${errorObj.message}`);

      // Send to Sentry
      trackFlowComplete(flowKey, this.pauseManager.state?.id ?? "no-state", false);
      captureException(errorObj, {
        tags: { flowKey, context: "flow-execution" },
        extra: { leadId: context.lead?.id, stepsCompleted: stepResults.length, lastStep: stepResults[stepResults.length - 1]?.stepId },
      });

      const result = buildFlowResult({ flowKey, leadId: context.lead?.id, steps: stepResults, startTime, stateId: this.pauseManager.state?.id, error: errorObj });
      await this.hooksManager.flowError(flowKey, errorObj, baseContext);
      await this.hooksManager.afterFlow(baseContext, result);
      return result;
    }
  }

  private getSkipReason<T>(stepDef: any, data: T | undefined, config: ProductConfiguration<T>, logger: FlowLogger): string | null {
    if (this.config.skipAuth && stepDef.type === "auth") return "skipAuth enabled";
    if (this.config.skipNavigation && stepDef.type === "navigation") return "skipNavigation enabled";
    if (stepDef.conditional && !evaluateConditional(stepDef.conditional, data, config, logger)) return `conditional '${stepDef.conditional}' returned false`;
    return null;
  }

  private async handleStepError(flowKey: string, stepDef: any, result: StepResult, ctx: ExecutionContext) {
    trackFlowStep(flowKey, stepDef.id, "error");
    await this.hooksManager.stepError(flowKey, stepDef, result, ctx);
  }

  private async handleStepSuccess(flowKey: string, stepDef: any, result: StepResult, index: number) {
    trackFlowStep(flowKey, stepDef.id, "success");
    await this.hooksManager.stepComplete(flowKey, stepDef, result);
    await this.pauseManager.checkpoint(index, stepDef.id);
  }

  requestPause(): void { this.pauseManager.requestPause(); }
  isPauseRequested(): boolean { return this.pauseManager.isPauseRequested; }
  getCurrentState(): FlowState | undefined { return this.pauseManager.state; }
  requestAbort(): void { this.abortRequested = true; }
  isAbortRequested(): boolean { return this.abortRequested; }

  static async resume<T = any>(stateId: string, context: Omit<ExecutionContext<T>, "stepDefinition" | "flowKey" | "logger">, config?: Omit<FlowExecutionConfig, "stateId" | "enablePauseResume">): Promise<FlowExecutionResult> {
    const state = await flowStateService.getState(stateId);
    if (!state) throw new Error(`Flow state not found: ${stateId}`);
    if (state.status !== "paused") throw new Error(`Cannot resume flow with status: ${state.status}`);
    return new FlowEngine({ ...config, enablePauseResume: true, stateId }).execute(state.flowKey, context);
  }
}

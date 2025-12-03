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
    console.log(`\n[FLOW_ENGINE] ========== EXECUTE() CALLED ==========`);
    console.log(`[FLOW_ENGINE] FlowKey: ${flowKey}`);
    console.log(`[FLOW_ENGINE] Lead ID: ${context.lead?.id || 'N/A'}`);
    console.log(`[FLOW_ENGINE] Page exists: ${!!context.page}`);
    console.log(`[FLOW_ENGINE] TransformedData exists: ${!!context.transformedData}`);
    console.log(`[FLOW_ENGINE] ArtifactsDir: ${context.artifactsDir}`);

    const startTime = Date.now();
    const stepResults: StepResult[] = [];
    console.log(`[FLOW_ENGINE] Resetting pause manager...`);
    this.pauseManager.reset();

    console.log(`[FLOW_ENGINE] Creating FlowLogger...`);
    const logger = new FlowLogger(flowKey, context.lead?.id, this.config.verbose);
    console.log(`[FLOW_ENGINE] Getting services for flow...`);
    const services = await getServicesForFlow(flowKey);
    console.log(`[FLOW_ENGINE] Services loaded`);
    const baseContext = { ...context, flowKey, logger, services } as ExecutionContext<T>;

    try {
      console.log(`[FLOW_ENGINE] Getting product config...`);
      const productConfig = getProductConfig(flowKey) as ProductConfiguration<T> | undefined;
      if (!productConfig) {
        console.error(`[FLOW_ENGINE] Product configuration not found: ${flowKey}`);
        throw new Error(`Product configuration not found: ${flowKey}`);
      }
      console.log(`[FLOW_ENGINE] Product config loaded: ${productConfig.steps.length} steps`);

      // Validate all step classes exist in registry before starting
      console.log(`[FLOW_ENGINE] Validating step classes...`);
      for (const stepDef of productConfig.steps) {
        if (stepDef.stepClass && !this.registry.has(stepDef.stepClass)) {
          console.error(`[FLOW_ENGINE] Step class not found: ${stepDef.stepClass}`);
          throw new Error(`Step class "${stepDef.stepClass}" not found in registry for step "${stepDef.id}"`);
        }
      }
      console.log(`[FLOW_ENGINE] All step classes validated`);

      console.log(`[FLOW_ENGINE] Initializing pause manager...`);
      const startIndex = await this.pauseManager.initialize(flowKey, context.lead?.id, logger);
      console.log(`[FLOW_ENGINE] Pause manager initialized, startIndex: ${startIndex}`);
      if (this.config.stateId) await this.hooksManager.flowResumed(flowKey, context.lead?.id, this.pauseManager.state?.id);

      logger.info(`Starting flow: ${flowKey} (${productConfig.steps.length} steps)`);

      console.log('\n========================================');
      console.log('FLOW EXECUTION START');
      console.log('========================================');
      console.log(`Flow: ${flowKey}`);
      console.log(`Lead ID: ${context.lead?.id || 'N/A'}`);
      console.log(`Steps: ${productConfig.steps.length}`);
      if (this.config.stateId) {
        console.log(`Resuming from state: ${this.config.stateId}`);
      }
      console.log('');

      await this.hooksManager.flowStart(flowKey, context.lead?.id, this.pauseManager.state?.id);
      await this.hooksManager.beforeFlow(baseContext);

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

      console.log('\n========================================');
      console.log('FLOW EXECUTION COMPLETE');
      console.log('========================================');
      console.log(`Flow: ${flowKey}`);
      console.log(`Lead ID: ${context.lead?.id || 'N/A'}`);
      console.log(`Total steps: ${stepResults.length}`);
      console.log(`Successful steps: ${stepResults.filter(s => s.success).length}`);
      console.log(`Failed steps: ${stepResults.filter(s => !s.success).length}`);
      console.log(`Total duration: ${finalResult.totalDuration}ms`);
      console.log(`Result: ${finalResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      console.log('');

      await this.hooksManager.flowComplete(flowKey, finalResult, baseContext);
      return finalResult;
    } catch (error) {
      await this.pauseManager.markFailed();
      const errorObj = error instanceof Error ? error : new Error(String(error));

      console.log('\n========================================');
      console.log('FLOW EXECUTION FAILED');
      console.log('========================================');
      console.log(`Flow: ${flowKey}`);
      console.log(`Lead ID: ${context.lead?.id || 'N/A'}`);
      console.log(`Steps completed: ${stepResults.length}`);
      console.log(`Error: ${errorObj.message}`);
      if (stepResults.length > 0) {
        const lastStep = stepResults[stepResults.length - 1];
        console.log(`Last step: ${lastStep.stepId} (${lastStep.success ? 'success' : 'failed'})`);
      }
      console.log('');

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
    await this.hooksManager.stepError(flowKey, stepDef, result, ctx);
    // Screenshot is now captured before afterStep hook
  }

  private async handleStepSuccess(flowKey: string, stepDef: any, result: StepResult, index: number) {
    await this.hooksManager.stepComplete(flowKey, stepDef, result);
    await this.pauseManager.checkpoint(index, stepDef.id);
    // Screenshot is now captured before afterStep hook
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

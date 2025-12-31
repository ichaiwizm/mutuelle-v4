/**
 * YamlFlowEngine - Main orchestrator for YAML-based flow execution
 */
import type { Page as _Page } from 'playwright';
import type { FlowDefinition, FlowResult, StepDefinition, ExecutionContext } from './types/index.js';
import { ActionExecutor } from './actions/index.js';
import { ExpressionResolver, StepInterpreter } from './interpreter/index.js';
import type { StepResult } from './interpreter/index.js';
import { createContext, createResolverContext, type ContextOptions } from './execution-context.js';
import type { ResolverContext } from './interpreter/types.js';

export interface EngineState {
  executionId: string;
  context: ExecutionContext;
  resolverContext: ResolverContext;
  currentStepIndex: number;
  isPaused: boolean;
}

const stateStore = new Map<string, EngineState>();

export class YamlFlowEngine {
  private isPaused = false;
  private currentStateId: string | null = null;

  /** Get current state ID for external access */
  getCurrentStateId(): string | null {
    return this.currentStateId;
  }

  async execute(flowDef: FlowDefinition, options: ContextOptions): Promise<FlowResult> {
    const context = createContext(options);
    const resolverContext = createResolverContext(context, options);
    context.status = 'running';

    const executor = new ActionExecutor(options.page);
    const resolver = new ExpressionResolver(resolverContext);
    const interpreter = new StepInterpreter({
      page: options.page, resolver, executor, timeout: flowDef.config?.defaultTimeout ?? 30000,
    });

    try {
      for (let i = context.currentStepIndex; i < flowDef.steps.length; i++) {
        if (this.isPaused) { this.saveState(context, resolverContext, i); context.status = 'pending'; break; }
        context.currentStepIndex = i;
        const stepResult = await this.executeStepWithRetry(
          flowDef.steps[i], interpreter, resolverContext, flowDef.config?.maxRetries ?? 3
        );
        context.stepResults.push({ ...stepResult, stepId: flowDef.steps[i].id, startTime: new Date(), retryCount: 0 });
        if (stepResult.status === 'failed' && flowDef.config?.stopOnError !== false) {
          context.status = 'failed'; break;
        }
      }
      if (context.status === 'running') context.status = 'completed';
    } catch { context.status = 'failed'; }

    return this.buildResult(context);
  }

  private async executeStepWithRetry(
    stepDef: StepDefinition, interpreter: StepInterpreter, ctx: ResolverContext, maxRetries: number
  ): Promise<StepResult> {
    let lastResult: StepResult = { stepId: stepDef.id, status: 'pending', durationMs: 0 };
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      lastResult = await interpreter.executeStep(stepDef, ctx);
      if (lastResult.status !== 'failed') return lastResult;
      if (attempt < maxRetries) await this.delay(stepDef.retry?.delayMs ?? 1000);
    }
    return lastResult;
  }

  pause(): void { this.isPaused = true; }

  async resume(stateId: string, options: ContextOptions): Promise<FlowResult | null> {
    const state = stateStore.get(stateId);
    if (!state) return null;
    this.isPaused = false;
    stateStore.delete(stateId);
    const flowDef: FlowDefinition = { metadata: { name: state.context.flowId, version: '1.0' }, steps: [] };
    return this.execute(flowDef, options);
  }

  private saveState(ctx: ExecutionContext, resolverCtx: ResolverContext, stepIndex: number): void {
    this.currentStateId = ctx.executionId;
    stateStore.set(ctx.executionId, {
      executionId: ctx.executionId, context: ctx, resolverContext: resolverCtx,
      currentStepIndex: stepIndex, isPaused: true
    });
  }

  private buildResult(ctx: ExecutionContext): FlowResult {
    const endTime = new Date();
    return {
      executionId: ctx.executionId, flowId: ctx.flowId, status: ctx.status,
      startTime: ctx.startTime, endTime, durationMs: endTime.getTime() - ctx.startTime.getTime(),
      stepResults: ctx.stepResults, output: ctx.variables.extracted, logs: ctx.logs, screenshots: [],
    };
  }

  private delay(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}

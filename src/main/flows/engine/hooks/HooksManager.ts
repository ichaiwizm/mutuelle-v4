import type { StepDefinition } from "../../../../shared/types/product";
import type { ExecutionContext, StepResult, FlowExecutionResult, FlowHooks, FlowEventData } from "../types";
import type { EventEmitter } from "events";

/**
 * Manages hook execution and event emission
 */
export class HooksManager {
  constructor(
    private hooks: FlowHooks,
    private emitter: EventEmitter
  ) {}

  async flowStart(flowKey: string, leadId?: string, stateId?: string): Promise<void> {
    const data: FlowEventData = { flowKey, leadId, stateId };
    this.emitter.emit("flow:start", data);
  }

  async flowComplete(flowKey: string, result: FlowExecutionResult, ctx: ExecutionContext): Promise<void> {
    this.emitter.emit("flow:complete", { flowKey, leadId: ctx.lead?.id, result });
    await this.hooks.afterFlow?.(ctx, result);
  }

  async flowError(flowKey: string, error: Error, ctx: ExecutionContext): Promise<void> {
    this.emitter.emit("flow:error", { flowKey, leadId: ctx.lead?.id, error });
    await this.hooks.onError?.(ctx, error);
  }

  async flowPaused(flowKey: string, leadId?: string, stateId?: string): Promise<void> {
    this.emitter.emit("flow:paused", { flowKey, leadId, stateId });
  }

  async flowResumed(flowKey: string, leadId?: string, stateId?: string): Promise<void> {
    this.emitter.emit("flow:resumed", { flowKey, leadId, stateId });
  }

  async beforeFlow(ctx: ExecutionContext): Promise<void> {
    await this.hooks.beforeFlow?.(ctx);
  }

  async afterFlow(ctx: ExecutionContext, result: FlowExecutionResult): Promise<void> {
    await this.hooks.afterFlow?.(ctx, result);
  }

  async stepStart(flowKey: string, stepDef: StepDefinition, ctx: ExecutionContext): Promise<void> {
    this.emitter.emit("step:start", { flowKey, stepId: stepDef.id, stepName: stepDef.name });
    await this.hooks.beforeStep?.(ctx, stepDef);
  }

  async stepComplete(flowKey: string, stepDef: StepDefinition, result: StepResult): Promise<void> {
    this.emitter.emit("step:complete", { flowKey, stepId: stepDef.id, stepName: stepDef.name, result });
  }

  async stepError(flowKey: string, stepDef: StepDefinition, result: StepResult, ctx: ExecutionContext): Promise<void> {
    this.emitter.emit("step:error", { flowKey, stepId: stepDef.id, stepName: stepDef.name, error: result.error });
    await this.hooks.onError?.(ctx, result.error!, stepDef);
  }

  async stepSkip(flowKey: string, stepDef: StepDefinition, reason: string, ctx: ExecutionContext): Promise<void> {
    this.emitter.emit("step:skip", { flowKey, stepId: stepDef.id, stepName: stepDef.name, reason });
    await this.hooks.onSkip?.(ctx, stepDef, reason);
  }

  async afterStep(ctx: ExecutionContext, stepDef: StepDefinition, result: StepResult): Promise<void> {
    await this.hooks.afterStep?.(ctx, stepDef, result);
  }
}

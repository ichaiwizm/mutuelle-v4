/**
 * StepInterpreter - Executes step definitions in YAML flows
 * Handles: auth, navigation, form-fill steps
 */
import type { Page } from 'playwright';
import type { StepDefinition, FormFillStep, NavigationStep, AuthStep } from '../types/step.js';
import type { ActionDefinition, ExecutionStatus } from '../types/index.js';
import { ActionExecutor } from '../actions/index.js';
import { ExpressionResolver } from './expression-resolver.js';
import { ConditionEvaluator } from './condition-evaluator.js';
import { FieldFiller } from './field-filler.js';
import { RepeatHandler } from './repeat-handler.js';
import type { ResolverContext } from './types.js';

export interface StepResult {
  stepId: string;
  status: ExecutionStatus;
  durationMs: number;
  error?: Error;
  extracted?: Record<string, unknown>;
}

export interface StepContext {
  page: Page;
  resolver: ExpressionResolver;
  executor: ActionExecutor;
  timeout?: number;
}

export class StepInterpreter {
  private conditionEvaluator: ConditionEvaluator;
  private fieldFiller: FieldFiller;
  private repeatHandler: RepeatHandler;

  constructor(private context: StepContext) {
    this.conditionEvaluator = new ConditionEvaluator(context.resolver);
    this.fieldFiller = new FieldFiller(context);
    this.repeatHandler = new RepeatHandler(context);
  }

  /** Get repeat handler for external use */
  getRepeatHandler(): RepeatHandler {
    return this.repeatHandler;
  }

  async executeStep(stepDef: StepDefinition, _resolverCtx: ResolverContext): Promise<StepResult> {
    const startTime = Date.now();
    const result: StepResult = { stepId: stepDef.id, status: 'pending', durationMs: 0 };

    try {
      if (stepDef.condition && !this.conditionEvaluator.evaluate(stepDef.condition.expression)) {
        return { ...result, status: 'completed', durationMs: Date.now() - startTime };
      }
      result.status = 'running';

      switch (stepDef.type) {
        case 'auth': await this.executeAuth(stepDef as AuthStep); break;
        case 'navigation': await this.executeActions((stepDef as NavigationStep).actions); break;
        case 'form-fill': await this.executeFormFill(stepDef as FormFillStep); break;
        default: throw new Error(`Unsupported step type: ${stepDef.type}`);
      }
      result.status = 'completed';
    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error : new Error(String(error));
    }
    result.durationMs = Date.now() - startTime;
    return result;
  }

  async executeActions(actions: ActionDefinition[] | undefined): Promise<void> {
    if (!actions) return;
    for (const action of actions) {
      await this.context.executor.execute(this.resolveAction(action));
    }
  }

  async executeFormFill(stepDef: FormFillStep): Promise<void> {
    await this.executeActions(stepDef.beforeFill as ActionDefinition[] | undefined);
    for (const field of stepDef.fields) await this.fieldFiller.fillField(field);
    await this.executeActions(stepDef.afterFill as ActionDefinition[] | undefined);
  }

  private async executeAuth(stepDef: AuthStep): Promise<void> {
    await this.fieldFiller.fillField(stepDef.credentials.username);
    await this.fieldFiller.fillField(stepDef.credentials.password);
    await this.context.page.click(this.context.resolver.resolve(String(stepDef.submitSelector)));
    await this.context.page.waitForSelector(
      this.context.resolver.resolve(String(stepDef.successIndicator)),
      { timeout: this.context.timeout }
    );
  }

  private resolveAction(action: ActionDefinition): ActionDefinition {
    const resolved = { ...action };
    if (resolved.selector) resolved.selector = this.context.resolver.resolve(resolved.selector);
    if (typeof resolved.value === 'string') resolved.value = this.context.resolver.resolve(resolved.value);
    if (resolved.url) resolved.url = this.context.resolver.resolve(resolved.url);
    return resolved;
  }
}

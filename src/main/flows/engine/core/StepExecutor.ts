import type { StepDefinition } from "../../../../shared/types/product";
import type { ExecutionContext, StepResult, FlowHooks } from "../types";
import type { StepRegistry } from "../StepRegistry";
import type { EventEmitter } from "events";

type StepExecutorDeps = {
  registry: StepRegistry;
  hooks: FlowHooks;
  emitter: EventEmitter;
};

/**
 * Executes a single step with retry logic
 */
export async function executeStepWithRetry<T>(
  stepDef: StepDefinition,
  context: ExecutionContext<T>,
  deps: StepExecutorDeps
): Promise<StepResult> {
  const { registry, hooks, emitter } = deps;
  const maxRetries = stepDef.maxRetries ?? 0;
  let lastResult: StepResult | null = null;

  const stepClass = stepDef.stepClass;
  if (!stepClass) {
    throw new Error(`Step ${stepDef.id} has no stepClass defined`);
  }

  const step = registry.get(stepClass);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      context.logger?.info(`Retrying step ${stepDef.id}`, { attempt, maxRetries });

      emitter.emit("step:retry", {
        flowKey: context.flowKey,
        stepId: stepDef.id,
        stepName: stepDef.name,
        attempt,
      });
      await hooks.onRetry?.(context, stepDef, attempt);
    }

    lastResult = await step.execute(context);

    if (lastResult.success) {
      lastResult.retries = attempt;
      return lastResult;
    }

    if (attempt < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
      context.logger?.debug(`Waiting ${delay}ms before retry`, { delay, attempt });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  if (lastResult) {
    lastResult.retries = maxRetries;
    return lastResult;
  }

  throw new Error(`Step ${stepDef.id} failed with no result`);
}

import type { NavigationStep, ActionDefinition, StepCondition, ExecutorActionType } from '@mutuelle/engine';

export interface StepConfig {
  id: string;
  name: string;
  description?: string;
  action: ExecutorActionType;
  selector?: string;
  value?: string;
  timeout?: number;
  optional?: boolean;
  retries?: number;
  waitBefore?: number;
  waitAfter?: number;
  condition?: StepCondition;
}

export interface Step {
  readonly id: string;
  readonly name: string;
  readonly action: ExecutorActionType;
  readonly config: Readonly<Omit<StepConfig, 'id' | 'name' | 'action'>>;
  toDefinition(): NavigationStep;
}

export function defineStep(config: StepConfig): Step {
  const {
    id,
    name,
    description,
    action,
    selector,
    value,
    timeout = 30000,
    optional = false,
    retries = 0,
    waitBefore = 0,
    waitAfter = 0,
    condition,
  } = config;

  const actionDef: ActionDefinition = {
    action,
    selector,
    value,
    timeout,
    waitBefore,
    waitAfter,
  };

  const step: Step = {
    id,
    name,
    action,
    config: Object.freeze({
      description,
      selector,
      value,
      timeout,
      optional,
      retries,
      waitBefore,
      waitAfter,
      condition,
    }),

    toDefinition(): NavigationStep {
      return {
        id,
        name,
        description,
        type: 'navigation',
        condition,
        optional,
        timeout,
        retry: retries > 0 ? { attempts: retries, delayMs: 1000 } : undefined,
        actions: [actionDef],
      };
    },
  };

  return Object.freeze(step);
}

import type { FlowDefinition, StepDefinition } from '@mutuelle/engine';

export interface FlowConfig<TInput = unknown, TOutput = unknown> {
  id: string;
  name: string;
  description?: string;
  version?: string;
  steps: StepDefinition[];
  input?: TInput;
  output?: TOutput;
  metadata?: Record<string, unknown>;
}

export interface Flow<_TInput = unknown, _TOutput = unknown> {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly steps: ReadonlyArray<StepDefinition>;
  readonly metadata: Readonly<Record<string, unknown>>;
  toDefinition(): FlowDefinition;
  validate(): ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function defineFlow<TInput = unknown, TOutput = unknown>(
  config: FlowConfig<TInput, TOutput>
): Flow<TInput, TOutput> {
  const { id, name, description = '', version = '1.0.0', steps, metadata = {} } = config;

  const flow: Flow<TInput, TOutput> = {
    id,
    name,
    description,
    version,
    steps: Object.freeze([...steps]),
    metadata: Object.freeze({ ...metadata }),

    toDefinition(): FlowDefinition {
      return {
        metadata: {
          name,
          version,
          description,
          ...metadata,
        },
        steps: [...steps],
      };
    },

    validate(): ValidationResult {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!id || id.trim() === '') {
        errors.push('Flow id is required');
      }
      if (!name || name.trim() === '') {
        errors.push('Flow name is required');
      }
      if (steps.length === 0) {
        warnings.push('Flow has no steps defined');
      }

      return { valid: errors.length === 0, errors, warnings };
    },
  };

  return Object.freeze(flow);
}

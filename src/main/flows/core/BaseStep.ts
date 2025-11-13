import type { StepContext, StepResult, StepMetadata } from '../types/FlowTypes';

/**
 * Abstract base class for all step implementations.
 * Steps are individual units of work (login, form fill, etc.)
 */
export abstract class BaseStep {
  protected metadata: StepMetadata;

  constructor(metadata: StepMetadata) {
    this.metadata = metadata;
  }

  /**
   * Main execution method - must be implemented by each step
   */
  abstract execute(context: StepContext): Promise<StepResult>;

  /**
   * Get step description for logging
   */
  describe(): string {
    return this.metadata.description;
  }

  /**
   * Get step name
   */
  getName(): string {
    return this.metadata.name;
  }

  /**
   * Check if step is optional
   */
  isOptional(): boolean {
    return this.metadata.optional ?? false;
  }

  /**
   * Helper: create a successful result
   */
  protected createSuccessResult(data?: unknown, duration: number = 0): StepResult {
    return {
      success: true,
      data,
      duration,
      stepName: this.metadata.name,
    };
  }

  /**
   * Helper: create a failed result
   */
  protected createFailedResult(error: Error, duration: number = 0): StepResult {
    return {
      success: false,
      error,
      duration,
      stepName: this.metadata.name,
    };
  }

  /**
   * Execute step with timing and error handling
   */
  async executeWithTiming(context: StepContext): Promise<StepResult> {
    const startTime = Date.now();
    try {
      const result = await this.execute(context);
      result.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return this.createFailedResult(err, Date.now() - startTime);
    }
  }
}

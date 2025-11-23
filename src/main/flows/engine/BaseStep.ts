import type { IStep, ExecutionContext, StepResult } from "./types";

/**
 * Abstract base class for all Step implementations
 * Provides common functionality like timing, error handling, and validation
 */
export abstract class BaseStep<T = any> implements IStep<T> {
  /**
   * Abstract method that subclasses must implement
   * Contains the actual step logic
   */
  protected abstract executeStep(context: ExecutionContext<T>): Promise<void>;

  /**
   * Execute the step with timing and error handling
   */
  async execute(context: ExecutionContext<T>): Promise<StepResult> {
    const startTime = Date.now();
    const { stepDefinition } = context;

    try {
      // Validate context before execution
      if (this.validate && !this.validate(context)) {
        throw new Error(`Step validation failed for ${stepDefinition.id}`);
      }

      // Execute the step logic
      await this.executeStep(context);

      const duration = Date.now() - startTime;

      return {
        success: true,
        stepId: stepDefinition.id,
        duration,
        retries: 0,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        stepId: stepDefinition.id,
        error: error instanceof Error ? error : new Error(String(error)),
        duration,
        retries: 0,
      };
    } finally {
      // Cleanup if implemented
      if (this.cleanup) {
        await this.cleanup(context);
      }
    }
  }

  /**
   * Default validation - checks that required dependencies are present
   */
  validate(context: ExecutionContext<T>): boolean {
    const { stepDefinition, lead, credentials } = context;

    // Check if lead is required and present
    if (stepDefinition.needsLead && !lead) {
      console.error(`Step ${stepDefinition.id} requires lead data but none provided`);
      return false;
    }

    // Check if credentials are required and present
    if (stepDefinition.needsCredentials && !credentials) {
      console.error(`Step ${stepDefinition.id} requires credentials but none provided`);
      return false;
    }

    return true;
  }

  /**
   * Optional cleanup method
   * Subclasses can override to add cleanup logic
   */
  async cleanup(context: ExecutionContext<T>): Promise<void> {
    // Default: no cleanup
  }
}

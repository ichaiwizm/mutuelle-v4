import type { ExecutionContext, StepResult } from '../types/FlowTypes';
import type { ProductResult, ProductMetadata } from '../types/ProductTypes';

/**
 * Abstract base class for all product implementations.
 */
export abstract class BaseProduct {
  abstract execute(context: ExecutionContext): Promise<ProductResult>;
  abstract getMetadata(): ProductMetadata;

  protected async beforeExecution?(context: ExecutionContext): Promise<void>;
  protected async afterExecution?(result: ProductResult): Promise<void>;
  protected async onError?(error: Error): Promise<void>;

  /**
   * Create a failed result
   */
  protected createFailedResult(
    error: Error,
    steps: StepResult[] = [],
    duration: number = 0
  ): ProductResult {
    return {
      success: false,
      error,
      steps,
      duration,
      warnings: [],
    };
  }

  /**
   * Create a successful result
   */
  protected createSuccessResult(
    quote: ProductResult['quote'],
    steps: StepResult[],
    duration: number,
    warnings: string[] = []
  ): ProductResult {
    return {
      success: true,
      quote,
      steps,
      duration,
      warnings,
    };
  }

  /**
   * Execute with hooks
   */
  protected async executeWithHooks(
    context: ExecutionContext
  ): Promise<ProductResult> {
    const startTime = Date.now();
    const steps: StepResult[] = [];

    try {
      if (this.beforeExecution) await this.beforeExecution(context);
      const result = await this.execute(context);
      if (this.afterExecution) await this.afterExecution(result);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.onError) await this.onError(err);
      return this.createFailedResult(err, steps, Date.now() - startTime);
    }
  }
}

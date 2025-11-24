import type {
  ExecutionContext,
  FlowExecutionConfig,
  FlowExecutionResult,
  StepResult,
} from "./types";
import type { StepDefinition, ProductConfiguration } from "../../../shared/types/product";
import { StepRegistry } from "./StepRegistry";
import { getProductConfig } from "../../services/productConfig/productConfigCore";
import { getEnvironment, getAlptisEnvironmentBehaviors } from "../config/alptis.config";

/**
 * Main Flow Execution Engine
 * Orchestrates the execution of flow steps based on product configuration
 */
export class FlowEngine {
  private registry: StepRegistry;
  private config: FlowExecutionConfig;

  constructor(config?: FlowExecutionConfig) {
    this.registry = StepRegistry.getInstance();

    // Auto-detect environment and apply appropriate behaviors
    const env = getEnvironment();
    const envBehaviors = getAlptisEnvironmentBehaviors(env);

    this.config = {
      stopOnError: true,
      screenshotOnError: envBehaviors.screenshotOnError,
      screenshotOnSuccess: envBehaviors.screenshotOnSuccess,
      verbose: envBehaviors.verbose,
      ...config, // Allow explicit overrides
    };

    if (this.config.verbose) {
      console.log(`[FlowEngine] Initialized with environment: ${env}`);
      console.log(`[FlowEngine] Behaviors: verbose=${envBehaviors.verbose}, screenshotOnError=${envBehaviors.screenshotOnError}, screenshotOnSuccess=${envBehaviors.screenshotOnSuccess}`);
    }
  }

  /**
   * Execute a complete flow
   */
  async execute<T = any>(
    flowKey: string,
    context: Omit<ExecutionContext<T>, "stepDefinition" | "flowKey">
  ): Promise<FlowExecutionResult> {
    const startTime = Date.now();
    const stepResults: StepResult[] = [];

    try {
      // Get product configuration
      const productConfig = getProductConfig(flowKey) as ProductConfiguration<T> | undefined;
      if (!productConfig) {
        throw new Error(`Product configuration not found for flowKey: ${flowKey}`);
      }

      this.log(`Starting flow execution: ${flowKey}`);
      this.log(`Total steps configured: ${productConfig.steps.length}`);

      // Execute each step in order
      for (const stepDef of productConfig.steps) {
        // Skip auth if configured
        if (this.config.skipAuth && stepDef.type === "auth") {
          this.log(`Skipping auth step: ${stepDef.id}`);
          continue;
        }

        // Skip navigation if configured
        if (this.config.skipNavigation && stepDef.type === "navigation") {
          this.log(`Skipping navigation step: ${stepDef.id}`);
          continue;
        }

        // Evaluate conditional
        if (stepDef.conditional && !this.evaluateConditional(stepDef.conditional, context.transformedData, productConfig)) {
          this.log(`Skipping conditional step: ${stepDef.id} (condition: ${stepDef.conditional})`);
          continue;
        }

        // Execute step with retry logic
        this.log(`Executing step: ${stepDef.id} (${stepDef.name})`);
        const stepResult = await this.executeStepWithRetry(stepDef, {
          ...context,
          flowKey,
          stepDefinition: stepDef,
        });

        stepResults.push(stepResult);

        if (!stepResult.success) {
          this.log(`Step failed: ${stepDef.id} - ${stepResult.error?.message}`);

          // Take screenshot on error if configured
          if (this.config.screenshotOnError && context.page) {
            try {
              const screenshotPath = `${context.artifactsDir || "."}/error-${stepDef.id}-${Date.now()}.png`;
              await context.page.screenshot({ path: screenshotPath, fullPage: true });
              this.log(`Screenshot saved: ${screenshotPath}`);
            } catch (err) {
              this.log(`Failed to take screenshot: ${err}`);
            }
          }

          // Stop on error if configured
          if (this.config.stopOnError) {
            throw stepResult.error || new Error(`Step ${stepDef.id} failed`);
          }
        } else {
          this.log(`Step completed: ${stepDef.id} (${stepResult.duration}ms)`);

          // Take screenshot on success if configured
          if (this.config.screenshotOnSuccess && context.page) {
            try {
              const screenshotPath = `${context.artifactsDir || "."}/success-${stepDef.id}-${Date.now()}.png`;
              await context.page.screenshot({ path: screenshotPath, fullPage: true });
              this.log(`Success screenshot saved: ${screenshotPath}`);
            } catch (err) {
              this.log(`Failed to take success screenshot: ${err}`);
            }
          }
        }
      }

      const totalDuration = Date.now() - startTime;
      const allSuccessful = stepResults.every((r) => r.success);

      return {
        success: allSuccessful,
        flowKey,
        leadId: context.lead?.id,
        steps: stepResults,
        totalDuration,
      };
    } catch (error) {
      const totalDuration = Date.now() - startTime;

      return {
        success: false,
        flowKey,
        leadId: context.lead?.id,
        steps: stepResults,
        totalDuration,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Execute a single step with retry logic
   */
  private async executeStepWithRetry<T>(
    stepDef: StepDefinition,
    context: ExecutionContext<T>
  ): Promise<StepResult> {
    const maxRetries = stepDef.maxRetries ?? 0;
    let lastResult: StepResult | null = null;

    // Get step implementation from registry
    const stepClass = stepDef.stepClass;
    if (!stepClass) {
      throw new Error(`Step ${stepDef.id} has no stepClass defined`);
    }

    const step = this.registry.get(stepClass);

    // Try executing with retries
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        this.log(`Retrying step ${stepDef.id}, attempt ${attempt}/${maxRetries}`);
      }

      lastResult = await step.execute(context);

      if (lastResult.success) {
        lastResult.retries = attempt;
        return lastResult;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // All retries failed
    if (lastResult) {
      lastResult.retries = maxRetries;
      return lastResult;
    }

    throw new Error(`Step ${stepDef.id} failed with no result`);
  }

  /**
   * Evaluate a conditional rule
   */
  private evaluateConditional<T>(
    conditionalName: string,
    transformedData: T | undefined,
    productConfig: ProductConfiguration<T>
  ): boolean {
    if (!transformedData) {
      return false;
    }

    const conditionalRules = productConfig.conditionalRules;
    if (!conditionalRules || !conditionalRules[conditionalName]) {
      console.warn(`Conditional rule not found: ${conditionalName}`);
      return false;
    }

    const rule = conditionalRules[conditionalName];
    return rule(transformedData);
  }

  /**
   * Log message if verbose mode is enabled
   */
  private log(message: string): void {
    if (this.config.verbose) {
      console.log(`[FlowEngine] ${message}`);
    }
  }
}

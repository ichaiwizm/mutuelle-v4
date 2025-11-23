import type { IStep } from "./types";
import { AlptisAuthStep } from "../platforms/alptis/steps/AlptisAuthStep";
import { AlptisNavigationStep } from "../platforms/alptis/steps/AlptisNavigationStep";
import { AlptisFormFillStep } from "../platforms/alptis/steps/AlptisFormFillStep";

/**
 * Registry for Step implementations
 * Maps step class names to their instantiated classes
 */
export class StepRegistry {
  private static instance: StepRegistry;
  private steps: Map<string, IStep>;

  private constructor() {
    this.steps = new Map();
    this.registerDefaultSteps();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): StepRegistry {
    if (!StepRegistry.instance) {
      StepRegistry.instance = new StepRegistry();
    }
    return StepRegistry.instance;
  }

  /**
   * Register default steps for all platforms
   */
  private registerDefaultSteps(): void {
    // Alptis steps
    this.register("AlptisAuthStep", new AlptisAuthStep());
    this.register("AlptisNavigationStep", new AlptisNavigationStep());
    this.register("AlptisFormFillStep", new AlptisFormFillStep());

    // SwissLife steps would go here
    // this.register("SwissLifeAuthStep", new SwissLifeAuthStep());
    // etc.
  }

  /**
   * Register a step implementation
   */
  register(className: string, step: IStep): void {
    this.steps.set(className, step);
  }

  /**
   * Get a step implementation by class name
   */
  get(className: string): IStep {
    const step = this.steps.get(className);
    if (!step) {
      throw new Error(`Step class not found in registry: ${className}`);
    }
    return step;
  }

  /**
   * Check if a step exists in the registry
   */
  has(className: string): boolean {
    return this.steps.has(className);
  }

  /**
   * Clear all registered steps (useful for testing)
   */
  clear(): void {
    this.steps.clear();
  }

  /**
   * Reset registry to default state
   */
  reset(): void {
    this.clear();
    this.registerDefaultSteps();
  }
}

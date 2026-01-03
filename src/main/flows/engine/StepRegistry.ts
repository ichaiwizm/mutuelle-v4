import type { IStep } from "./types";
import { AlptisAuthStep } from "../platforms/alptis/steps/AlptisAuthStep";
import { AlptisNavigationStep } from "../platforms/alptis/steps/AlptisNavigationStep";
import { AlptisFormFillStep } from "../platforms/alptis/steps/AlptisFormFillStep";
import { AlptisDevisCaptureStep } from "../platforms/alptis/steps/AlptisDevisCaptureStep";
import { AlptisSanteProPlusNavigationStep } from "../platforms/alptis/steps/AlptisSanteProPlusNavigationStep";
import { AlptisSanteProPlusFormFillStep } from "../platforms/alptis/steps/AlptisSanteProPlusFormFillStep";
import { SwissLifeAuthStep } from "../platforms/swisslifeone/steps/SwissLifeAuthStep";
import { SwissLifeNavigationStep } from "../platforms/swisslifeone/steps/SwissLifeNavigationStep";
import { SwissLifeFormFillStep } from "../platforms/swisslifeone/steps/SwissLifeFormFillStep";
import { EntoriaAuthStep } from "../platforms/entoria/steps/EntoriaAuthStep";
import { EntoriaPackFamilleNavigationStep } from "../platforms/entoria/steps/EntoriaPackFamilleNavigationStep";
import { EntoriaPackFamilleFormFillStep } from "../platforms/entoria/steps/EntoriaPackFamilleFormFillStep";

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
    // Alptis steps (Santé Select)
    this.register("AlptisAuthStep", new AlptisAuthStep());
    this.register("AlptisNavigationStep", new AlptisNavigationStep());
    this.register("AlptisFormFillStep", new AlptisFormFillStep());
    this.register("AlptisDevisCaptureStep", new AlptisDevisCaptureStep());

    // Alptis steps (Santé Pro Plus)
    this.register("AlptisSanteProPlusNavigationStep", new AlptisSanteProPlusNavigationStep());
    this.register("AlptisSanteProPlusFormFillStep", new AlptisSanteProPlusFormFillStep());

    // SwissLife steps
    this.register("SwissLifeAuthStep", new SwissLifeAuthStep());
    this.register("SwissLifeNavigationStep", new SwissLifeNavigationStep());
    this.register("SwissLifeFormFillStep", new SwissLifeFormFillStep());

    // Entoria steps (Pack Famille)
    this.register("EntoriaAuthStep", new EntoriaAuthStep());
    this.register("EntoriaPackFamilleNavigationStep", new EntoriaPackFamilleNavigationStep());
    this.register("EntoriaPackFamilleFormFillStep", new EntoriaPackFamilleFormFillStep());
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

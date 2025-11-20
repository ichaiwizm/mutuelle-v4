import type { Frame } from '@playwright/test';
import type { SwissLifeOneFormData } from '../../transformers/types';
import { Step1Fill } from './sections/Step1Fill';

/**
 * SwissLife One Form Fill Orchestrator
 *
 * Main entry point for filling the SwissLife One form.
 * Delegates to step-specific fill classes.
 *
 * Usage:
 * ```typescript
 * const orchestrator = new FormFillOrchestrator();
 * await orchestrator.fillStep1(frame, transformedData);
 * ```
 */
export class FormFillOrchestrator {
  private readonly step1Fill: Step1Fill;

  constructor() {
    this.step1Fill = new Step1Fill();
  }

  /**
   * Fill Step 1: Informations du projet et assurés (complete)
   * Fills all sections of Step 1
   */
  async fillStep1(frame: Frame, data: SwissLifeOneFormData): Promise<void> {
    await this.step1Fill.fill(frame, data);
  }

  /**
   * Fill Step 1 - Section 1 only: Nom du projet
   */
  async fillStep1Section1(frame: Frame, data: SwissLifeOneFormData): Promise<void> {
    await this.step1Fill.fillSection1(frame, data);
  }

  /**
   * Fill Step 1 - Section 2 only: Vos projets (besoins)
   */
  async fillStep1Section2(frame: Frame, data: SwissLifeOneFormData): Promise<void> {
    await this.step1Fill.fillSection2(frame, data);
  }

  /**
   * Fill Step 1 - Section 3 only: Couverture santé individuelle (type_simulation)
   */
  async fillStep1Section3(frame: Frame, data: SwissLifeOneFormData): Promise<void> {
    await this.step1Fill.fillSection3(frame, data);
  }

  /**
   * Fill Step 1 - Section 4 only: Données de l'assuré principal
   */
  async fillStep1Section4(frame: Frame, data: SwissLifeOneFormData): Promise<void> {
    await this.step1Fill.fillSection4(frame, data);
  }

  /**
   * Fill Step 1 - Section 5 only: Données du conjoint (optional)
   */
  async fillStep1Section5(frame: Frame, data: SwissLifeOneFormData): Promise<void> {
    await this.step1Fill.fillSection5(frame, data);
  }

  /**
   * Check for form validation errors
   * @returns Array of error messages (empty if no errors)
   */
  async checkForErrors(frame: Frame): Promise<string[]> {
    const errors: string[] = [];

    const errorElements = frame.locator('[class*="error"], [class*="invalid"], [role="alert"]');
    const errorCount = await errorElements.count();

    for (let i = 0; i < errorCount; i++) {
      const errorText = await errorElements.nth(i).textContent();
      if (errorText?.trim()) {
        errors.push(errorText.trim());
      }
    }

    return errors;
  }
}

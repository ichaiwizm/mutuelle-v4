import type { Frame } from 'playwright';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';
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
  async fillStep1(frame: Frame, data: SwissLifeOneFormData, logger?: FlowLogger): Promise<void> {
    await this.step1Fill.fill(frame, data, logger);
  }

  /**
   * Fill Step 1 - Section 1 only: Nom du projet
   */
  async fillStep1Section1(frame: Frame, data: SwissLifeOneFormData, logger?: FlowLogger): Promise<void> {
    await this.step1Fill.fillSection1(frame, data, logger);
  }

  /**
   * Fill Step 1 - Section 2 only: Vos projets (besoins)
   */
  async fillStep1Section2(frame: Frame, data: SwissLifeOneFormData, logger?: FlowLogger): Promise<void> {
    await this.step1Fill.fillSection2(frame, data, logger);
  }

  /**
   * Fill Step 1 - Section 3 only: Couverture santé individuelle (type_simulation)
   */
  async fillStep1Section3(frame: Frame, data: SwissLifeOneFormData, logger?: FlowLogger): Promise<void> {
    await this.step1Fill.fillSection3(frame, data, logger);
  }

  /**
   * Fill Step 1 - Section 4 only: Données de l'assuré principal
   */
  async fillStep1Section4(frame: Frame, data: SwissLifeOneFormData, logger?: FlowLogger): Promise<void> {
    await this.step1Fill.fillSection4(frame, data, logger);
  }

  /**
   * Fill Step 1 - Section 5 only: Données du conjoint (optional)
   */
  async fillStep1Section5(frame: Frame, data: SwissLifeOneFormData, logger?: FlowLogger): Promise<void> {
    await this.step1Fill.fillSection5(frame, data, logger);
  }

  /**
   * Fill Step 1 - Section 6 only: Enfants (optional)
   */
  async fillStep1Section6(frame: Frame, data: SwissLifeOneFormData, logger?: FlowLogger): Promise<void> {
    await this.step1Fill.fillSection6(frame, data, logger);
  }

  /**
   * Fill Step 1 - Section 7 only: Gammes et Options (final section)
   */
  async fillStep1Section7(frame: Frame, data: SwissLifeOneFormData, logger?: FlowLogger): Promise<void> {
    await this.step1Fill.fillSection7(frame, data, logger);
  }

  /**
   * Submit Step 1: Click "Suivant" button to navigate past Step 1
   * Note: May navigate to Step 2 (Santé) or Step 3 (Synthèse) depending on form state
   * The form may auto-advance after filling Section 7, so we check first if already on Step 2/3
   */
  async submitStep1(frame: Frame, logger?: FlowLogger): Promise<void> {
    // Step 2 indicator: #tabs-sante is the Santé tab content container
    // Step 3 indicator: text "Cotisation" in the Synthèse page
    const step2Locator = frame.locator('#tabs-sante');
    const step3Locator = frame.locator('text=Cotisation').first();

    // Check if we're already on Step 2 or Step 3 (form might auto-advance)
    const alreadyOnStep2 = await step2Locator.isVisible().catch(() => false);
    const alreadyOnStep3 = await step3Locator.isVisible().catch(() => false);

    if (alreadyOnStep2 || alreadyOnStep3) {
      logger?.info(`Already navigated past Step 1 (on ${alreadyOnStep2 ? 'Step 2' : 'Step 3'})`);
      return;
    }

    logger?.info('Clicking Suivant button to submit Step 1');
    // Use specific button ID for Step 1 submit (there are multiple "Suivant" buttons)
    const submitButton = frame.locator('#bt-suite-projet');

    // Check if button is visible before clicking
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // Wait for navigation - either Step 2 content OR Step 3 content
      await Promise.race([
        step2Locator.waitFor({ state: 'visible', timeout: 25000 }),  // Step 2 indicator
        step3Locator.waitFor({ state: 'visible', timeout: 25000 }),  // Step 3 indicator
      ]);
      logger?.info('Successfully navigated past Step 1');
    } else {
      // Button not visible, might already be past Step 1
      logger?.info('Submit button not visible, checking if already past Step 1');
      await Promise.race([
        step2Locator.waitFor({ state: 'visible', timeout: 10000 }),
        step3Locator.waitFor({ state: 'visible', timeout: 10000 }),
      ]);
      logger?.info('Confirmed: Already past Step 1');
    }
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

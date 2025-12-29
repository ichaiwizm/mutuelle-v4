/**
 * FormFillOrchestrator pour Entoria TNS Santé
 * Formulaire de tarification en 4 étapes
 */

import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';
import type { PackFamilleFormData } from '../../transformers/types';
import { ProfilFill, BesoinFill, GarantiesFill } from './sections';

export class FormFillOrchestrator {
  private profilFill = new ProfilFill();
  private besoinFill = new BesoinFill();
  private garantiesFill = new GarantiesFill();

  /**
   * Remplit l'étape 1 : Profil de l'entrepreneur
   */
  async fillProfil(page: Page, data: PackFamilleFormData, logger?: FlowLogger): Promise<void> {
    return this.profilFill.fill(page, data, logger);
  }

  /**
   * Clique sur CONTINUER pour passer à l'étape 2
   */
  async submitProfil(page: Page, logger?: FlowLogger): Promise<void> {
    return this.profilFill.submit(page, logger);
  }

  /**
   * Remplit l'étape 2 : Recueil des besoins
   */
  async fillBesoin(page: Page, data: PackFamilleFormData, logger?: FlowLogger): Promise<void> {
    return this.besoinFill.fill(page, data, logger);
  }

  /**
   * Clique sur suivant pour passer à l'étape 3
   */
  async submitBesoin(page: Page, logger?: FlowLogger): Promise<void> {
    return this.besoinFill.submit(page, logger);
  }

  /**
   * Remplit l'étape 3 : Choix des garanties
   */
  async fillGaranties(page: Page, data: PackFamilleFormData, logger?: FlowLogger): Promise<void> {
    return this.garantiesFill.fill(page, data, logger);
  }

  /**
   * Exécute le flow complet
   */
  async fillAll(page: Page, data: PackFamilleFormData, logger?: FlowLogger): Promise<void> {
    // Étape 1
    await this.fillProfil(page, data, logger);
    await this.submitProfil(page, logger);

    // Étape 2
    await this.fillBesoin(page, data, logger);
    await this.submitBesoin(page, logger);

    // Étape 3
    await this.fillGaranties(page, data, logger);

    logger?.info('All steps completed');
  }

  /**
   * Check for form validation errors
   * Required by IFormFillService interface
   */
  async checkForErrors(page: Page, logger?: FlowLogger): Promise<string[]> {
    const errors: string[] = [];
    try {
      // Check for Angular Material error messages
      const errorElements = page.locator('mat-error, .error-message, .mat-mdc-form-field-error');
      const count = await errorElements.count();

      for (let i = 0; i < count; i++) {
        const text = await errorElements.nth(i).textContent();
        if (text?.trim()) {
          errors.push(text.trim());
        }
      }

      if (errors.length > 0) {
        logger?.warn('Form errors found', { errors });
      }
    } catch {
      // Ignore errors when checking for errors
    }
    return errors;
  }
}

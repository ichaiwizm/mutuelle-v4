import type { Page } from 'playwright';
import type { SanteProPlusFormData } from '../../transformers/types';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';
import { ERROR_SELECTORS } from './selectors';
import { Section1Fill, Section2Fill, Section3Fill, Section4Fill } from './sections';

/**
 * FormFillOrchestrator - Orchestrates filling of all Alptis Santé Pro Plus form sections
 *
 * Architecture:
 * - Section 1: Mise en place du contrat (2-3 fields)
 * - Section 2: Adhérent(e) (up to 11 fields including micro_entrepreneur, cadre_exercice, statut_professionnel, ville)
 * - Section 3: Conjoint(e) (toggle + 3 form fields - NO cadre_exercice)
 * - Section 4: Enfant(s) (toggle + 2 fields per child)
 */
export class FormFillOrchestrator {
  private readonly section1: Section1Fill;
  private readonly section2: Section2Fill;
  private readonly section3: Section3Fill;
  private readonly section4: Section4Fill;

  constructor() {
    this.section1 = new Section1Fill();
    this.section2 = new Section2Fill();
    this.section3 = new Section3Fill();
    this.section4 = new Section4Fill();
  }

  /**
   * Fill Section 1: Mise en place du contrat
   */
  async fillMiseEnPlace(page: Page, data: SanteProPlusFormData, logger?: FlowLogger): Promise<void> {
    await this.section1.fill(page, data, logger);
  }

  /**
   * Fill Section 2: Adhérent(e)
   */
  async fillAdherent(page: Page, data: SanteProPlusFormData, logger?: FlowLogger): Promise<void> {
    await this.section2.fill(page, data, logger);
  }

  /**
   * Fill Section 3: Conjoint(e) - Toggle only
   */
  async fillConjointToggle(page: Page, hasConjoint: boolean, logger?: FlowLogger): Promise<void> {
    await this.section3.fillToggle(page, hasConjoint, logger);
  }

  /**
   * Fill Section 3: Conjoint(e) - Complete form
   * Note: Should be called AFTER fillConjointToggle when hasConjoint is true
   */
  async fillConjoint(page: Page, data: SanteProPlusFormData['conjoint'], logger?: FlowLogger): Promise<void> {
    await this.section3.fill(page, data, logger);
  }

  /**
   * Fill Section 4: Enfant(s) - Toggle only
   */
  async fillEnfantsToggle(page: Page, hasEnfants: boolean, logger?: FlowLogger): Promise<void> {
    await this.section4.fillToggle(page, hasEnfants, logger);
  }

  /**
   * Fill Section 4: Enfant(s) - All children
   * Note: Should be called AFTER fillEnfantsToggle when hasEnfants is true
   */
  async fillEnfants(page: Page, enfants: SanteProPlusFormData['enfants'], logger?: FlowLogger): Promise<void> {
    await this.section4.fill(page, enfants, logger);
  }

  /**
   * Submit form: Click "Garanties" button to navigate to Step 2
   */
  async submit(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.info('Clicking Garanties button to submit form');
    // Use role selector which is more reliable than class selector
    await page.getByRole('button', { name: 'Garanties' }).click();
    // Attendre la navigation vers la page Garanties
    await page.waitForURL(/\/sante-pro-plus\/garanties/, { timeout: 10000 });
    logger?.info('Successfully navigated to Garanties page', { url: page.url() });
  }

  /**
   * Save lead: Click "Enregistrer" button on the Garanties page
   * This opens a confirmation modal
   */
  async saveGaranties(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.info('Clicking Enregistrer button on Garanties page');
    const enregistrerBtn = page.locator('button:has-text("Enregistrer")').first();
    await enregistrerBtn.waitFor({ state: 'visible', timeout: 10000 });
    await enregistrerBtn.click();
    // Attendre que le modal apparaisse
    await page.waitForTimeout(500);
    logger?.info('Enregistrer clicked, modal should be visible');
  }

  /**
   * Confirm save: Click "Enregistrer et continuer" in the confirmation modal
   * This finalizes the lead registration
   */
  async confirmSave(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.info('Clicking "Enregistrer et continuer" in confirmation modal');
    const continuerBtn = page.locator('button:has-text("Enregistrer et continuer")');
    await continuerBtn.waitFor({ state: 'visible', timeout: 10000 });
    await continuerBtn.click();
    // Attendre que le modal se ferme
    await page.waitForTimeout(1000);
    logger?.info('Lead saved successfully');
  }

  /**
   * Check for validation errors on the page
   * @returns Array of error messages (empty if no errors)
   */
  async checkForErrors(page: Page, logger?: FlowLogger): Promise<string[]> {
    const errorLocator = page.locator(ERROR_SELECTORS.generic);
    const errorCount = await errorLocator.count();

    if (errorCount > 0) {
      const errors = await errorLocator.allTextContents();
      logger?.error('Validation errors found', undefined, { errors, errorCount });
      return errors;
    }

    return [];
  }
}

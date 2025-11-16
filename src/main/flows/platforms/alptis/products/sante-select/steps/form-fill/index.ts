import type { Page } from 'playwright';
import type { AlptisFormData } from '../../transformers/types';
import { SECTION_1_SELECTORS, ERROR_SELECTORS } from './selectors';

/**
 * FormFillStep - Responsible for filling the Alptis Santé Select form
 * Currently implements Section 1: Mise en place du contrat
 */
export class FormFillStep {
  /**
   * Fill Section 1: Mise en place du contrat
   *
   * Fields:
   * 1. remplacement_contrat (toggle) - Optional
   * 2. demande_resiliation (radio) - Conditional, required if remplacement_contrat = true
   * 3. date_effet (date) - Always required
   *
   * @param page Playwright page object
   * @param data Transformed form data
   */
  async fillMiseEnPlace(page: Page, data: AlptisFormData): Promise<void> {
    console.log('--- SECTION: Mise en place du contrat ---');

    // Field 1: Remplacement contrat toggle
    await this.fillRemplacementContrat(page, data.mise_en_place.remplacement_contrat);

    // Field 2: Demande résiliation (conditional)
    if (data.mise_en_place.remplacement_contrat && data.mise_en_place.demande_resiliation) {
      await this.fillDemandeResiliation(page, data.mise_en_place.demande_resiliation);
    }

    // Field 3: Date d'effet (always required)
    await this.fillDateEffet(page, data.mise_en_place.date_effet);

    console.log('✅ Section "Mise en place du contrat" complétée');
    console.log('---');
  }

  /**
   * Fill Field 1: Remplacement contrat toggle
   * @private
   */
  private async fillRemplacementContrat(page: Page, shouldCheck: boolean): Promise<void> {
    console.log(`[1/3] Remplacement contrat: ${shouldCheck ? 'Oui' : 'Non'}`);

    try {
      const toggleLocator = page.locator(SECTION_1_SELECTORS.remplacement_contrat.primary).first();
      const isCurrentlyChecked = await toggleLocator.isChecked();

      // Only click if state needs to change
      if (isCurrentlyChecked !== shouldCheck) {
        await toggleLocator.click();
        console.log(`  ↳ Toggle cliqué (${isCurrentlyChecked ? 'décoché' : 'coché'})`);

        // Wait for potential animation
        await page.waitForTimeout(300);
      } else {
        console.log(`  ↳ Déjà dans l'état correct`);
      }

      // Verify final state
      await this.verifyToggleState(page, toggleLocator, shouldCheck);

    } catch (error) {
      console.error('❌ Erreur lors du remplissage de remplacement_contrat:', error);
      throw error;
    }
  }

  /**
   * Fill Field 2: Demande résiliation radio (CONDITIONAL)
   * Only visible when remplacement_contrat = true
   * @private
   */
  private async fillDemandeResiliation(page: Page, value: 'Oui' | 'Non'): Promise<void> {
    console.log(`[2/3] Demande résiliation: ${value}`);
    console.log(`  ↳ Champ conditionnel activé`);

    try {
      // Wait for conditional field to appear
      const radioSelector = SECTION_1_SELECTORS.demande_resiliation.primary;
      await page.waitForSelector(radioSelector, { state: 'visible', timeout: 5000 });
      console.log(`  ↳ Champ visible`);

      // Select the radio option
      const radioLocator = page.locator(SECTION_1_SELECTORS.demande_resiliation.byValue(value));
      await radioLocator.click();
      console.log(`  ↳ Option "${value}" sélectionnée`);

      // Verify selection
      await this.verifyRadioSelection(page, radioLocator, value);

    } catch (error) {
      console.error('❌ Erreur lors du remplissage de demande_resiliation:', error);
      throw error;
    }
  }

  /**
   * Fill Field 3: Date d'effet (ALWAYS REQUIRED)
   * @private
   */
  private async fillDateEffet(page: Page, dateEffet: string): Promise<void> {
    const fieldNumber = '[3/3]'; // Always field 3, even if field 2 is skipped
    console.log(`${fieldNumber} Date d'effet: ${dateEffet}`);

    try {
      const dateInputLocator = page.locator(SECTION_1_SELECTORS.date_effet.primary).first();

      // Clear any existing value
      await dateInputLocator.clear();

      // Fill the date
      await dateInputLocator.fill(dateEffet);
      console.log(`  ↳ Date saisie`);

      // Verify the value was entered correctly
      await this.verifyDateValue(page, dateInputLocator, dateEffet);

    } catch (error) {
      console.error('❌ Erreur lors du remplissage de date_effet:', error);
      throw error;
    }
  }

  /**
   * Verify toggle state
   * @private
   */
  private async verifyToggleState(page: Page, locator: any, expectedState: boolean): Promise<void> {
    const actualState = await locator.isChecked();

    if (actualState !== expectedState) {
      throw new Error(
        `Toggle state mismatch. Expected: ${expectedState}, Got: ${actualState}`
      );
    }

    console.log(`  ✓ Vérifié: toggle ${expectedState ? 'checked' : 'unchecked'}`);
  }

  /**
   * Verify radio selection
   * @private
   */
  private async verifyRadioSelection(page: Page, locator: any, expectedValue: string): Promise<void> {
    const isChecked = await locator.isChecked();

    if (!isChecked) {
      throw new Error(
        `Radio selection failed. Expected "${expectedValue}" to be checked`
      );
    }

    console.log(`  ✓ Vérifié: radio "${expectedValue}" sélectionné`);
  }

  /**
   * Verify date input value
   * @private
   */
  private async verifyDateValue(page: Page, locator: any, expectedDate: string): Promise<void> {
    const actualValue = await locator.inputValue();

    if (actualValue !== expectedDate) {
      throw new Error(
        `Date entry mismatch. Expected: "${expectedDate}", Got: "${actualValue}"`
      );
    }

    console.log(`  ✓ Vérifié: date = "${expectedDate}"`);
  }

  /**
   * Check for validation errors in the section
   */
  async checkForErrors(page: Page): Promise<string[]> {
    const errorLocator = page.locator(ERROR_SELECTORS.generic);
    const errorCount = await errorLocator.count();

    if (errorCount > 0) {
      const errors = await errorLocator.allTextContents();
      console.error('❌ Erreurs de validation trouvées:', errors);
      return errors;
    }

    return [];
  }
}

/**
 * Section Garanties - Étape 3 du formulaire Entoria TNS Santé
 */

import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import type { PackFamilleFormData } from '../../../transformers/types';
import { ENTORIA_SELECTORS } from '../selectors';

export class GarantiesFill {
  /**
   * Remplit l'étape 3 : Choix des garanties
   */
  async fill(page: Page, data: PackFamilleFormData, logger?: FlowLogger): Promise<void> {
    logger?.info('Filling step 3: Garanties');
    const { garanties } = data;
    const selectors = ENTORIA_SELECTORS.garanties;

    // Attendre que la page soit prête
    await page.waitForTimeout(1000);

    // 1. Fréquence de règlement
    const freqSelector = garanties.frequence_reglement === 'Mensuelle'
      ? selectors.frequence.mensuelle
      : selectors.frequence.trimestrielle;
    await page.locator(freqSelector).first().click();
    logger?.debug('Selected frequence', { value: garanties.frequence_reglement });

    // 2. Date d'effet (peut être pré-remplie)
    const dateEffetInput = page.locator(selectors.date_effet.primary).first();
    if (await dateEffetInput.isVisible()) {
      const currentValue = await dateEffetInput.inputValue();
      if (!currentValue || currentValue !== garanties.date_effet) {
        await dateEffetInput.clear();
        await dateEffetInput.fill(garanties.date_effet);
        // Cliquer ailleurs pour déclencher la validation
        await page.keyboard.press('Tab');
        await page.waitForTimeout(500);
        // Fermer le modal d'erreur si la date est invalide
        await this.dismissDateEffetModal(page, logger);
        logger?.debug('Filled date_effet', { value: garanties.date_effet });
      }
    }

    await page.waitForTimeout(1000);

    // 3. Ajouter conjoint si nécessaire
    if (garanties.avec_conjoint) {
      const conjointBtn = page.getByRole('button', { name: 'Son conjoint' });
      if (await conjointBtn.isVisible({ timeout: 2000 })) {
        await conjointBtn.click({ force: true });
        logger?.debug('Added conjoint');
        await page.waitForTimeout(2000);
      }
    }

    // 4. Ajouter enfants si nécessaire
    if (garanties.avec_enfants) {
      const enfantsBtn = page.getByRole('button', { name: /enfant/i });
      if (await enfantsBtn.isVisible({ timeout: 2000 })) {
        await enfantsBtn.click({ force: true });
        logger?.debug('Added enfants');
        await page.waitForTimeout(2000);
      }
    }

    logger?.info('Completed step 3: Garanties');
  }

  /**
   * Ferme un éventuel modal d'erreur de date
   */
  private async dismissDateEffetModal(page: Page, logger?: FlowLogger): Promise<void> {
    try {
      const okButton = page.getByRole('button', { name: 'OK' });
      if (await okButton.isVisible({ timeout: 1000 })) {
        await okButton.click();
        logger?.debug('Dismissed date effet modal');
        await page.waitForTimeout(500);
      }
    } catch {
      // Pas de modal, c'est normal
    }
  }
}

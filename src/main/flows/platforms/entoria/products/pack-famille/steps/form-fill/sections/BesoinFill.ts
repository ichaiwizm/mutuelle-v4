/**
 * Section Besoin - Étape 2 du formulaire Entoria TNS Santé
 */

import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import type { PackFamilleFormData } from '../../../transformers/types';
import { ENTORIA_SELECTORS } from '../selectors';

export class BesoinFill {
  /**
   * Remplit l'étape 2 : Recueil des besoins
   */
  async fill(page: Page, data: PackFamilleFormData, logger?: FlowLogger): Promise<void> {
    logger?.info('Filling step 2: Besoin');
    const { besoin } = data;
    const selectors = ENTORIA_SELECTORS.besoin;

    // Hospitalisation uniquement ?
    const btnSelector = besoin.hospitalisation_uniquement
      ? selectors.hospitalisation_oui.primary
      : selectors.hospitalisation_non.primary;

    const btn = page.locator(btnSelector).first();
    await btn.waitFor({ state: 'visible', timeout: 5000 });
    await btn.click();
    logger?.debug('Selected hospitalisation_uniquement', { value: besoin.hospitalisation_uniquement });

    await page.waitForTimeout(1000);

    logger?.info('Completed step 2: Besoin');
  }

  /**
   * Clique sur suivant pour passer à l'étape 3
   */
  async submit(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.info('Submitting step 2');

    const suivantBtn = page.locator(ENTORIA_SELECTORS.besoin.suivant.primary);
    await suivantBtn.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    logger?.info('Moved to step 3');
  }
}

/**
 * Navigation pour Entoria Pack Famille
 *
 * Navigue vers le formulaire Santé TNS depuis le dashboard
 */

import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';

export class EntoriaPackFamilleNavigation {
  /**
   * Navigue vers le formulaire Santé TNS
   */
  async execute(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.info('Navigating to Santé TNS form');

    // Attendre que la page d'accueil soit chargée
    await page.waitForLoadState('networkidle');

    // Chercher et cliquer sur "Santé TNS" dans la section "Assurances de personnes individuelles"
    const santeTNS = page.locator('text=Santé TNS').first();

    const isVisible = await santeTNS.isVisible().catch(() => false);
    if (!isVisible) {
      logger?.warn('Santé TNS link not immediately visible, scrolling...');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(1000);
    }

    await santeTNS.waitFor({ state: 'visible', timeout: 10000 });
    await santeTNS.click();

    logger?.debug('Clicked on Santé TNS');

    // Attendre que le formulaire se charge
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Vérifier qu'on est bien sur le formulaire
    const formTitle = page.locator('text=tarification du projet');
    await formTitle.waitFor({ state: 'visible', timeout: 10000 });

    logger?.info('Successfully navigated to Santé TNS form');
  }
}

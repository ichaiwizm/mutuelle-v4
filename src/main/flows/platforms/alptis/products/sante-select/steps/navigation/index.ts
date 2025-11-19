import type { Page } from 'playwright';
import { setupAxeptioInterception } from '../../../../lib/cookie-interceptor';
import { AlptisUrls } from '../../../../../../config';

/**
 * Étape de navigation vers le formulaire Santé Select
 *
 * Cette étape se charge de :
 * 1. Naviguer vers la page du formulaire Santé Select
 * 2. Attendre que la page soit complètement chargée
 *
 * Note: Le bandeau de cookies (Axeptio) doit être bloqué dans le test
 * avant le login pour persister pendant toute la session
 */
export class NavigationStep {
  /**
   * Exécute la navigation vers le formulaire
   */
  async execute(page: Page): Promise<void> {
    await setupAxeptioInterception(page, { debug: process.env.ALPTIS_DEBUG_COOKIES === '1' });
    await page.goto(AlptisUrls.santeSelectForm);
    await page.waitForLoadState('networkidle');
  }
}

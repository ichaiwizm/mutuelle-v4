import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';
import { setupAxeptioInterception } from '../../../../lib/cookie-interceptor';
import { AlptisUrls } from '../../../../../../config';

/**
 * Étape de navigation vers le formulaire Santé Pro Plus
 *
 * Cette étape se charge de :
 * 1. Naviguer vers la page du formulaire Santé Pro Plus
 * 2. Attendre que la page soit complètement chargée
 *
 * Note: Le bandeau de cookies (Axeptio) doit être bloqué dans le test
 * avant le login pour persister pendant toute la session
 */
export class NavigationStep {
  /**
   * Exécute la navigation vers le formulaire
   */
  async execute(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.info('Starting navigation to Alptis Santé Pro Plus form');
    await setupAxeptioInterception(page, { debug: process.env.ALPTIS_DEBUG_COOKIES === '1' });
    logger?.debug('Navigating to form URL', { url: AlptisUrls.santeProPlusForm });
    await page.goto(AlptisUrls.santeProPlusForm);
    await page.waitForLoadState('networkidle');
    logger?.info('Navigation completed - Form page loaded');
  }
}

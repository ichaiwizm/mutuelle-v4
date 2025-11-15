import type { Page } from 'playwright';

/**
 * URL du formulaire Alptis Santé Select
 */
export const ALPTIS_SANTE_SELECT_FORM_URL = 'https://pro.alptis.org/sante-select/informations-projet/';

/**
 * Étape de navigation vers le formulaire Santé Select
 *
 * Cette étape se charge de :
 * 1. Naviguer vers la page du formulaire Santé Select
 * 2. Attendre que la page soit complètement chargée
 */
export class NavigationStep {
  /**
   * Exécute la navigation vers le formulaire
   */
  async execute(page: Page): Promise<void> {
    await page.goto(ALPTIS_SANTE_SELECT_FORM_URL);
    await page.waitForLoadState('networkidle');
  }
}

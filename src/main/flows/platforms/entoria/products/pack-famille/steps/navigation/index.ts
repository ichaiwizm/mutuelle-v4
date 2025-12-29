/**
 * Navigation pour Entoria Pack Famille
 *
 * Navigue vers le formulaire Santé TNS en créant une NOUVELLE tarification
 * depuis le dashboard, section "Assurances de personnes individuelles"
 *
 * Note: Le formulaire s'ouvre dans un modal/overlay sur le dashboard
 */

import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';

export class EntoriaPackFamilleNavigation {
  /**
   * Navigue vers le formulaire Santé TNS en créant une nouvelle tarification
   */
  async execute(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.info('Current URL after auth', { url: page.url() });

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // 1. Aller au dashboard (accueil)
    logger?.info('Navigating to dashboard...');
    await page.goto('https://espacecourtier.entoria.fr/accueil');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // 2. Scroll vers la section "Assurances de personnes individuelles"
    logger?.info('Scrolling to "Assurances de personnes individuelles" section...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // 3. Trouver et cliquer sur la carte Santé TNS dans la section produits
    logger?.info('Looking for Santé TNS card in products section...');

    // Attendre que la section "Assurances de personnes individuelles" soit visible
    const individuSection = page.locator('text=Assurances de personnes individuelles');
    await individuSection.waitFor({ state: 'visible', timeout: 10000 });

    // Trouver le Santé TNS dans cette section spécifique (pas dans "Derniers projets")
    // Utiliser la structure de la page : le texte "Santé TNS" après "Assurances de personnes individuelles"
    // mais avant le footer
    const santeTNSInSection = page
      .locator('text=Assurances de personnes individuelles')
      .locator('~')  // siblings following
      .locator('text=Santé TNS')
      .first();

    // Si pas trouvé avec siblings, chercher dans le conteneur parent
    let santeTNSCard = santeTNSInSection;
    if (!(await santeTNSCard.isVisible({ timeout: 3000 }).catch(() => false))) {
      // Fallback: chercher le Santé TNS qui est le plus bas sur la page (hors footer)
      logger?.info('Using position-based selection...');
      const allSanteTNS = await page.locator('text=Santé TNS').all();

      // Trouver celui avec la position Y la plus appropriée (dans la zone centrale-basse)
      let bestCandidate = null;
      let bestY = 0;

      for (const el of allSanteTNS) {
        const box = await el.boundingBox().catch(() => null);
        if (box && box.y > 0 && box.y < 2000 && box.y > bestY) {
          // Prendre celui le plus bas mais pas dans le footer
          bestCandidate = el;
          bestY = box.y;
        }
      }

      if (bestCandidate) {
        santeTNSCard = bestCandidate;
        logger?.info(`Selected Santé TNS at Y position ${bestY}`);
      }
    }

    await santeTNSCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Hover puis clic (certaines interfaces Angular nécessitent le hover)
    logger?.info('Hovering and clicking on Santé TNS card...');
    await santeTNSCard.hover();
    await page.waitForTimeout(500);
    await santeTNSCard.click();

    await page.waitForTimeout(5000);

    // 4. Le formulaire s'ouvre après le clic
    // Note: Le formulaire s'ouvre dans un overlay Angular, pas de changement d'URL
    logger?.info('Successfully navigated to Santé TNS form (new tarification)');
  }
}

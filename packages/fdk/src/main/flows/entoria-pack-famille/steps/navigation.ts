/**
 * Navigation step for Entoria Pack Famille
 * Navigate to Sante TNS form from dashboard
 */
import type { Page } from 'playwright';
import { SELECTORS } from '../selectors';

export interface NavigationResult {
  success: boolean;
  error?: string;
}

/**
 * Navigate to Sante TNS form by clicking on product card
 */
export async function executeNavigation(page: Page): Promise<NavigationResult> {
  try {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Navigate to dashboard
    await page.goto('https://espacecourtier.entoria.fr/accueil');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Scroll to products section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Wait for section
    const section = page.locator(SELECTORS.navigation.dashboard);
    await section.waitFor({ state: 'visible', timeout: 10000 });

    // Find Sante TNS card (avoid "Derniers projets" section)
    const allSanteTNS = await page.locator(SELECTORS.navigation.santeTNS).all();
    let bestCandidate = null;
    let bestY = 0;

    for (const el of allSanteTNS) {
      const box = await el.boundingBox().catch(() => null);
      if (box && box.y > 0 && box.y < 2000 && box.y > bestY) {
        bestCandidate = el;
        bestY = box.y;
      }
    }

    if (!bestCandidate) {
      return { success: false, error: 'Sante TNS card not found' };
    }

    await bestCandidate.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await bestCandidate.hover();
    await page.waitForTimeout(500);
    await bestCandidate.click();
    await page.waitForTimeout(5000);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Navigation step definition */
export const navigationStep = {
  id: 'entoria-navigation',
  name: 'Navigate to Sante TNS Form',
  type: 'navigation' as const,
  execute: executeNavigation,
};

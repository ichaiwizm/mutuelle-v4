import type { Locator, Page } from 'playwright';

/**
 * Actions utilitaires Playwright pour formulaires
 */

/**
 * Déclenche un blur global en cliquant en haut-gauche du body.
 * Utile pour fermer les date pickers et valider les champs.
 */
export async function blurField(page: Page): Promise<void> {
  const body = page.locator('body');
  await body.click({ position: { x: 1, y: 1 } });
  await page.waitForTimeout(150);
}

/**
 * Efface puis saisit une valeur dans un champ texte.
 */
export async function clearAndType(locator: Locator, value: string): Promise<void> {
  await locator.clear();
  await locator.fill(value);
}

/**
 * Sélectionne une option d'un <select> natif par value.
 */
export async function selectByValue(locator: Locator, value: string): Promise<void> {
  await locator.selectOption(value);
}



import type { Page } from 'playwright';
import { verifySelectValue } from '../verifiers';
import { PROFESSION_LABELS, REGIME_LABELS } from '../helpers/form-labels';

/**
 * Generic function to fill "Catégorie socioprofessionnelle" dropdown field
 *
 * @param page - Playwright page object
 * @param value - The profession enum value
 * @param fieldIndex - Position (0 for adherent, 1 for conjoint)
 * @param fieldLabel - Label for logging purposes
 * @param verificationSelector - CSS selector for verification
 */
export async function fillCategorieSocioprofessionnelleField(
  page: Page,
  value: string,
  fieldIndex: number,
  fieldLabel: string,
  verificationSelector: string
): Promise<void> {
  console.log(`${fieldLabel}: ${value}`);

  const label = PROFESSION_LABELS[value as any];
  if (!label) throw new Error(`Label inconnu: ${value}`);

  const textbox = page.getByRole('textbox', { name: /catégorie socioprofessionnelle/i }).nth(fieldIndex);
  await textbox.click();
  await textbox.fill(label);
  await page.waitForTimeout(500);

  await page.locator('.totem-select-option__label').filter({ hasText: label }).first().click();
  await verifySelectValue(page, page.locator(verificationSelector), value);
}

/**
 * Generic function to fill "Régime obligatoire" dropdown field
 *
 * @param page - Playwright page object
 * @param value - The regime enum value
 * @param fieldIndex - Position (0 for adherent, 1 for conjoint)
 * @param fieldLabel - Label for logging purposes
 * @param verificationSelector - CSS selector for verification
 */
export async function fillRegimeObligatoireField(
  page: Page,
  value: string,
  fieldIndex: number,
  fieldLabel: string,
  verificationSelector: string
): Promise<void> {
  console.log(`${fieldLabel}: ${value}`);

  const label = REGIME_LABELS[value];
  if (!label) throw new Error(`Label inconnu: ${value}`);

  const textbox = page.getByRole('textbox', { name: /régime obligatoire/i }).nth(fieldIndex);
  await textbox.click();
  await textbox.fill(label);
  await page.waitForTimeout(700);

  // Match exact du texte (important: "Sécurité sociale" vs "Sécurité sociale des indépendants")
  const options = await page.locator('.totem-select-option__label:visible').all();
  for (const opt of options) {
    if ((await opt.textContent())?.trim() === label) {
      await opt.click();
      await page.waitForTimeout(300);
      await verifySelectValue(page, page.locator(verificationSelector), value);
      return;
    }
  }
  throw new Error(`Option "${label}" not found`);
}

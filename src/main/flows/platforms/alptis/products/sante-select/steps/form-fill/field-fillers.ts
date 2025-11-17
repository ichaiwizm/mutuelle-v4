import type { Page } from 'playwright';
import { clearAndType, blurField } from './actions';
import { verifyDateValue, verifySelectValue } from './verifiers';
import { PROFESSION_LABELS } from './mappers/profession-labels';
import { REGIME_LABELS, CADRE_EXERCICE_LABELS } from './mappers/regime-labels';

export * from './fill-section1';
export * from './fill-section2';
export * from './fill-section3';

/**
 * Generic function to fill date fields (date d'effet, date de naissance, etc.)
 * Uses the common date input selector and handles filling, verification, and blur
 *
 * @param page - Playwright page object
 * @param dateValue - Date string in DD/MM/YYYY format
 * @param fieldIndex - Position of the date field on the page (0 = first, 1 = second, etc.)
 * @param fieldLabel - Label for logging purposes (e.g., "Date d'effet", "Date de naissance")
 */
export async function fillDateField(
  page: Page,
  dateValue: string,
  fieldIndex: number,
  fieldLabel: string
): Promise<void> {
  console.log(`${fieldLabel}: ${dateValue}`);

  const dateSelector = "input[placeholder='Ex : 01/01/2020']";
  const locator = page.locator(dateSelector).nth(fieldIndex);

  await clearAndType(locator, dateValue);
  console.log(`  ↳ Date saisie`);

  await verifyDateValue(page, locator, dateValue);
  await blurField(page);
}

/**
 * Generic function to fill "Cadre d'exercice" radio button field
 *
 * @param page - Playwright page object
 * @param value - The cadre d'exercice value
 * @param fieldIndex - Position (0 for adherent, 1 for conjoint)
 * @param fieldLabel - Label for logging purposes
 */
export async function fillCadreExerciceField(
  page: Page,
  value: 'SALARIE' | 'INDEPENDANT_PRESIDENT_SASU_SAS',
  fieldIndex: number,
  fieldLabel: string
): Promise<void> {
  console.log(`${fieldLabel}: ${value}`);

  const labelText = CADRE_EXERCICE_LABELS[value];
  if (!labelText) throw new Error(`Label inconnu pour cadre d'exercice: ${value}`);

  const label = page.locator(`label:has-text("${labelText}")`).nth(fieldIndex);
  await label.waitFor({ state: 'visible', timeout: 5000 });
  await label.click();
  console.log(`  ↳ Option "${labelText}" sélectionnée`);
}

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

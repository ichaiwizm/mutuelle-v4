import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import type { AlptisProfession } from '../../../transformers/types';
import { verifySelectValue } from '../verifiers';
import { PROFESSION_LABELS, REGIME_LABELS } from '../helpers/form-labels';
import { AlptisTimeouts, AlptisSelectors } from '../../../../../../../config';

/**
 * Generic function to fill "Catégorie socioprofessionnelle" dropdown field
 *
 * @param page - Playwright page object
 * @param value - The profession enum value
 * @param fieldIndex - Position (0 for adherent, 1 for conjoint)
 * @param fieldLabel - Label for logging purposes
 * @param verificationSelector - CSS selector for verification
 * @param logger - Optional FlowLogger instance
 */
export async function fillCategorieSocioprofessionnelleField(
  page: Page,
  value: string,
  fieldIndex: number,
  fieldLabel: string,
  verificationSelector: string,
  logger?: FlowLogger
): Promise<void> {
  logger?.debug(`Filling ${fieldLabel}`, { fieldLabel, value, fieldIndex });

  const label = PROFESSION_LABELS[value as AlptisProfession];
  if (!label) throw new Error(`Label inconnu: ${value}`);

  const textbox = page.getByRole('textbox', { name: /catégorie socioprofessionnelle/i }).nth(fieldIndex);
  await textbox.click();
  await textbox.fill(label);
  await page.waitForTimeout(AlptisTimeouts.dropdownProfession);

  await page.locator(AlptisSelectors.dropdownOption).filter({ hasText: label }).first().click();
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
 * @param logger - Optional FlowLogger instance
 */
export async function fillRegimeObligatoireField(
  page: Page,
  value: string,
  fieldIndex: number,
  fieldLabel: string,
  verificationSelector: string,
  logger?: FlowLogger
): Promise<void> {
  logger?.debug(`Filling ${fieldLabel}`, { fieldLabel, value, fieldIndex });

  const label = REGIME_LABELS[value];
  if (!label) throw new Error(`Label inconnu: ${value}`);

  const textbox = page.getByRole('textbox', { name: /régime obligatoire/i }).nth(fieldIndex);
  await textbox.click();
  await textbox.fill(label);
  await page.waitForTimeout(AlptisTimeouts.dropdownRegime);

  // Match exact du texte (important: "Sécurité sociale" vs "Sécurité sociale des indépendants")
  const options = await page.locator(`${AlptisSelectors.dropdownOption}:visible`).all();
  for (const opt of options) {
    if ((await opt.textContent())?.trim() === label) {
      await opt.click();
      await page.waitForTimeout(AlptisTimeouts.optionClick);
      await verifySelectValue(page, page.locator(verificationSelector), value);
      return;
    }
  }
  throw new Error(`Option "${label}" not found`);
}

/**
 * Fill "Ville" dropdown field (NOUVEAU pour Santé Pro Plus)
 * Auto-rempli via le code postal
 *
 * @param page - Playwright page object
 * @param logger - Optional FlowLogger instance
 */
export async function fillVilleField(
  page: Page,
  logger?: FlowLogger
): Promise<void> {
  logger?.debug('Waiting for Ville dropdown to be populated from code postal');

  // Wait for the ville dropdown to be enabled (populated from code postal)
  const villeTextbox = page.getByRole('textbox', { name: /ville/i }).first();

  // Wait for the dropdown to have options
  await page.waitForTimeout(AlptisTimeouts.dropdownRegime);

  // Click to open dropdown
  await villeTextbox.click();
  await page.waitForTimeout(AlptisTimeouts.dropdownProfession);

  // Select the first visible option
  const firstOption = page.locator(`${AlptisSelectors.dropdownOption}:visible`).first();
  const optionText = await firstOption.textContent();

  if (optionText) {
    await firstOption.click();
    logger?.debug('Ville selected', { ville: optionText.trim() });
  } else {
    logger?.warn('No ville options found');
  }
}

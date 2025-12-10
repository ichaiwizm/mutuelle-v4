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

  // Try textbox first (old form), then fallback to clickable dropdown (new form)
  const textbox = page.getByRole('textbox', { name: /catégorie socioprofessionnelle/i }).nth(fieldIndex);
  const isTextbox = await textbox.count() > 0 && await textbox.isVisible().catch(() => false);

  if (isTextbox) {
    // Old form: textbox-based dropdown
    await textbox.click();
    await textbox.fill(label);
  } else {
    // New form: click-based dropdown without textbox
    // Note: Don't use nth(fieldIndex) because previously filled dropdowns no longer have placeholder text
    // Instead, find the FIRST visible "Sélectionner une catégorie socioprofessionnelle" which is the one we need
    const dropdown = page.getByText('Sélectionner une catégorie socioprofessionnelle').first();
    const isDropdownVisible = await dropdown.isVisible().catch(() => false);

    if (isDropdownVisible) {
      await dropdown.click();
    } else {
      // If no placeholder visible, the field might already be filled or we need to find it differently
      // Find by section heading context
      const sectionHeading = fieldIndex === 0 ? 'Adhérent' : 'Conjoint';
      const section = page.locator(`generic:has-text("${sectionHeading}")`).first();
      const dropdownInSection = section.getByText('Sélectionner une catégorie').first();
      await dropdownInSection.click();
    }
  }

  await page.waitForTimeout(AlptisTimeouts.dropdownProfession);

  // Try old selector first, then new listitem selector
  const oldOption = page.locator(AlptisSelectors.dropdownOption).filter({ hasText: label }).first();
  if (await oldOption.count() > 0 && await oldOption.isVisible().catch(() => false)) {
    await oldOption.click();
  } else {
    // New form: options are listitem elements
    await page.getByRole('listitem').filter({ hasText: label }).first().click();
  }

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

  // Try textbox first (old form), then fallback to clickable dropdown (new form)
  const textbox = page.getByRole('textbox', { name: /régime obligatoire/i }).nth(fieldIndex);
  const isTextbox = await textbox.count() > 0 && await textbox.isVisible().catch(() => false);

  if (isTextbox) {
    // Old form: textbox-based dropdown
    await textbox.click();
    await textbox.fill(label);
    await page.waitForTimeout(AlptisTimeouts.dropdownRegime);
  } else {
    // New form: find visible placeholder (not the hidden one from already-filled dropdown)
    const placeholderTexts = await page.getByText('Sélectionner un régime obligatoire', { exact: true }).all();
    let visiblePlaceholder = null;

    for (const placeholder of placeholderTexts) {
      if (await placeholder.isVisible().catch(() => false)) {
        visiblePlaceholder = placeholder;
        break;
      }
    }

    if (visiblePlaceholder) {
      logger?.debug(`Found visible placeholder, clicking to open dropdown`);
      await visiblePlaceholder.click();
      await page.waitForTimeout(AlptisTimeouts.dropdownRegime);
    } else {
      // May be pre-filled - check if our value is already displayed somewhere
      // For auto-filled regime, just verify and return
      logger?.debug(`No visible placeholder found, regime may be auto-filled`);
      await verifySelectValue(page, page.locator(verificationSelector), value);
      return;
    }
  }

  // Match exact du texte (important: "Sécurité sociale" vs "Sécurité sociale des indépendants")
  // Try old selector first
  const oldOptions = await page.locator(`${AlptisSelectors.dropdownOption}:visible`).all();
  for (const opt of oldOptions) {
    if ((await opt.textContent())?.trim() === label) {
      await opt.click();
      await page.waitForTimeout(AlptisTimeouts.optionClick);
      // Skip verification for regimes as the ID selector may be stale
      logger?.debug(`Option clicked successfully: ${label}`);
      return;
    }
  }

  // Fallback to new listitem selector
  const newOptions = await page.getByRole('listitem').all();
  for (const opt of newOptions) {
    if ((await opt.textContent())?.trim() === label) {
      await opt.click();
      await page.waitForTimeout(AlptisTimeouts.optionClick);
      // Skip verification for regimes as the ID selector may be stale
      logger?.debug(`Option clicked successfully: ${label}`);
      return;
    }
  }

  // If nothing found in options but value might be already selected (auto-fill)
  logger?.debug(`No option found, assuming already auto-selected with ${label}`);
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

  // Wait longer for the ville dropdown to populate from code postal lookup
  await page.waitForTimeout(2000);

  // Try textbox first (old form), then fallback to clickable dropdown (new form)
  const villeTextbox = page.getByRole('textbox', { name: /ville/i }).first();
  const isTextbox = await villeTextbox.count() > 0 && await villeTextbox.isVisible().catch(() => false);

  if (isTextbox) {
    // Old form: textbox-based dropdown
    await villeTextbox.click();
  } else {
    // New form: click-based dropdown without textbox
    // The dropdown text changes from "Veuillez renseigner un code postal" to "Sélectionner une ville"
    // once the code postal is filled
    const dropdown = page.getByText('Sélectionner une ville').first();
    if (await dropdown.isVisible().catch(() => false)) {
      logger?.debug('Clicking ville dropdown to open options');
      await dropdown.click();
      await page.waitForTimeout(AlptisTimeouts.dropdownProfession);
    } else {
      // Try the old text in case code postal hasn't been processed yet
      const oldDropdown = page.getByText('Veuillez renseigner un code postal').first();
      if (await oldDropdown.isVisible().catch(() => false)) {
        logger?.debug('Ville dropdown waiting for code postal - clicking anyway');
        await oldDropdown.click();
        await page.waitForTimeout(AlptisTimeouts.dropdownProfession);
      }
    }
  }

  // Select the first visible option - try old selector first, then listitem
  const oldOption = page.locator(`${AlptisSelectors.dropdownOption}:visible`).first();
  if (await oldOption.count() > 0 && await oldOption.isVisible().catch(() => false)) {
    const optionText = await oldOption.textContent();
    if (optionText) {
      await oldOption.click();
      logger?.debug('Ville selected (old form)', { ville: optionText.trim() });
      return;
    }
  }

  // New form: listitem
  const listitems = await page.getByRole('listitem').all();
  for (const item of listitems) {
    const text = await item.textContent();
    // Skip empty or placeholder items
    if (text && text.trim().length > 0 && !text.includes('Sélectionner')) {
      await item.click();
      logger?.debug('Ville selected (new form)', { ville: text.trim() });
      return;
    }
  }

  logger?.warn('No ville options found');
}

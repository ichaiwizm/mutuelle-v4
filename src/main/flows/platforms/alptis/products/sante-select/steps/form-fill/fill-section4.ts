import type { Page } from 'playwright';
import { SECTION_4_SELECTORS } from './selectors/section4';
import { fillToggleField, fillDateField, fillRegimeObligatoireField } from './field-fillers';

/**
 * Section 4 - Toggle Enfants
 */
export async function fillToggleEnfants(page: Page, shouldCheck: boolean): Promise<void> {
  await fillToggleField(page, shouldCheck, 2, '[1/1] Toggle enfants', SECTION_4_SELECTORS.toggle_enfants.primary);
}

/**
 * Section 4 - Date de naissance d'un enfant
 * @param page - Playwright page object
 * @param dateNaissance - Date in DD/MM/YYYY format
 * @param childIndex - Index of the child (0 for first child, 1 for second, etc.)
 */
export async function fillEnfantDateNaissance(page: Page, dateNaissance: string, childIndex: number): Promise<void> {
  // Date fields indices depend on whether conjoint is present:
  // WITHOUT conjoint:
  // - nth(0) = Date d'effet
  // - nth(1) = Date naissance adhérent
  // - nth(2) = Date naissance 1er enfant
  // - nth(3) = Date naissance 2ème enfant
  // WITH conjoint:
  // - nth(0) = Date d'effet
  // - nth(1) = Date naissance adhérent
  // - nth(2) = Date naissance conjoint
  // - nth(3) = Date naissance 1er enfant
  // - nth(4) = Date naissance 2ème enfant

  // Detect if conjoint toggle is checked by counting visible date fields
  const dateSelector = "input[placeholder='Ex : 01/01/2020']";
  const visibleDateFields = await page.locator(dateSelector).count();

  // If we have 2 date fields visible (date effet + adherent), no conjoint
  // If we have 3+ date fields visible, conjoint is present
  const hasConjoint = visibleDateFields >= 3;
  const dateFieldIndex = hasConjoint ? 3 + childIndex : 2 + childIndex;

  await fillDateField(page, dateNaissance, dateFieldIndex, `[1/2] Date de naissance enfant ${childIndex + 1}`);
}

/**
 * Section 4 - Régime obligatoire d'un enfant
 * @param page - Playwright page object
 * @param value - The regime enum value
 * @param childIndex - Index of the child (0 for first child, 1 for second, etc.)
 */
export async function fillEnfantRegimeObligatoire(page: Page, value: string, childIndex: number): Promise<void> {
  // Regime fields indices:
  // - nth(0) = Adhérent
  // - nth(1) = Conjoint
  // - nth(2) = 1er enfant
  // - nth(3) = 2ème enfant
  // - etc.
  const regimeFieldIndex = 2 + childIndex;

  // Verification selector - uses 0-based indexing for all children
  const verificationSelector = `#regime-obligatoire-enfant-${childIndex}`;

  await fillRegimeObligatoireField(
    page,
    value,
    regimeFieldIndex,
    `[2/2] Régime enfant ${childIndex + 1}`,
    verificationSelector
  );
}

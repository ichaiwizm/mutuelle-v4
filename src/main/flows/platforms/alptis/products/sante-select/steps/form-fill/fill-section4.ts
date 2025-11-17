import type { Page } from 'playwright';
import { SECTION_4_SELECTORS } from './selectors/section4';
import { fillToggleField, fillDateField } from './field-fillers';

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
  // Date fields indices:
  // - nth(0) = Date d'effet
  // - nth(1) = Date naissance adhérent
  // - nth(2) = Date naissance conjoint
  // - nth(3) = Date naissance 1er enfant
  // - nth(4) = Date naissance 2ème enfant
  // - etc.
  const dateFieldIndex = 3 + childIndex;
  await fillDateField(page, dateNaissance, dateFieldIndex, `[1/1] Date de naissance enfant ${childIndex + 1}`);
}

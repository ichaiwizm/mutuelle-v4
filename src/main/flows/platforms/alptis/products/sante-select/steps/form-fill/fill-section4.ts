import type { Page, Locator } from 'playwright';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';
import { SECTION_4_SELECTORS } from './selectors/section4';
import { fillToggleField, fillDateField, fillRegimeObligatoireField } from './operations';
import { AlptisTimeouts, AlptisSelectors } from '../../../../../../config';

/**
 * Wait for a button to become enabled (poll-based, no @playwright/test dependency)
 */
async function waitForButtonEnabled(button: Locator, timeout: number): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await button.isEnabled()) return;
    await button.page().waitForTimeout(100);
  }
  throw new Error(`Button did not become enabled within ${timeout}ms`);
}

/**
 * Wait for a button to become disabled (poll-based, no @playwright/test dependency)
 */
async function waitForButtonDisabled(button: Locator, timeout: number): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await button.isDisabled()) return;
    await button.page().waitForTimeout(100);
  }
  throw new Error(`Button did not become disabled within ${timeout}ms`);
}

/**
 * Section 4 - Toggle Enfants
 */
export async function fillToggleEnfants(page: Page, shouldCheck: boolean, logger?: FlowLogger): Promise<void> {
  await fillToggleField(page, shouldCheck, 2, '[1/1] Toggle enfants', SECTION_4_SELECTORS.toggle_enfants.primary, logger);
}

/**
 * Section 4 - Date de naissance d'un enfant
 * @param page - Playwright page object
 * @param dateNaissance - Date in DD/MM/YYYY format
 * @param childIndex - Index of the child (0 for first child, 1 for second, etc.) - used for logging only
 *
 * IMPORTANT: When adding children, previous children become closed accordions,
 * so their fields are not visible. Only the currently open child's fields are counted.
 * Therefore, the date field index is ALWAYS the same for the active child.
 */
export async function fillEnfantDateNaissance(page: Page, dateNaissance: string, childIndex: number, logger?: FlowLogger): Promise<void> {
  // Date field index for the CURRENTLY OPEN child (previous children are closed):
  // WITHOUT conjoint:
  // - nth(0) = Date d'effet
  // - nth(1) = Date naissance adhérent
  // - nth(2) = Date naissance enfant (currently open)
  // WITH conjoint:
  // - nth(0) = Date d'effet
  // - nth(1) = Date naissance adhérent
  // - nth(2) = Date naissance conjoint
  // - nth(3) = Date naissance enfant (currently open)

  // Detect if conjoint toggle is checked by counting visible date fields
  const dateSelector = AlptisSelectors.dateInput;
  const visibleDateFields = await page.locator(dateSelector).count();

  // If we have 3 date fields visible (date effet + adherent + enfant), no conjoint
  // If we have 4+ date fields visible, conjoint is present
  const hasConjoint = visibleDateFields >= 4;

  // FIXED index: always the same for the currently open child
  const dateFieldIndex = hasConjoint ? 3 : 2;

  await fillDateField(page, dateNaissance, dateFieldIndex, `[1/2] Date de naissance enfant ${childIndex + 1}`, logger);
}

/**
 * Section 4 - Régime obligatoire d'un enfant
 * @param page - Playwright page object
 * @param value - The regime enum value
 * @param childIndex - Index of the child (0 for first child, 1 for second, etc.) - used for verification selector
 *
 * IMPORTANT: When adding children, previous children become closed accordions,
 * so their fields are not visible. Only the currently open child's fields are counted.
 * Therefore, the regime field index is ALWAYS the same for the active child.
 */
export async function fillEnfantRegimeObligatoire(page: Page, value: string, childIndex: number, logger?: FlowLogger): Promise<void> {
  // Regime field index for the CURRENTLY OPEN child (previous children are closed):
  // WITHOUT conjoint:
  // - nth(0) = Régime adhérent
  // - nth(1) = Régime enfant (currently open)
  // WITH conjoint:
  // - nth(0) = Régime adhérent
  // - nth(1) = Régime conjoint
  // - nth(2) = Régime enfant (currently open)

  // Detect if conjoint is present by counting visible regime fields
  const regimeSelector = AlptisSelectors.regimeDropdown;
  const regimeFields = await page.locator(regimeSelector).count();

  // 2 fields = without conjoint (adherent, enfant)
  // 3+ fields = with conjoint (adherent, conjoint, enfant)
  const hasConjoint = regimeFields >= 3;

  // Calculate the correct index based on conjoint presence
  const regimeFieldIndex = hasConjoint ? 2 : 1;

  // Verification selector - uses 0-based indexing for all children
  const verificationSelector = `#regime-obligatoire-enfant-${childIndex}`;

  await fillRegimeObligatoireField(
    page,
    value,
    regimeFieldIndex,
    `[2/2] Régime enfant ${childIndex + 1}`,
    verificationSelector,
    logger
  );
}

/**
 * Section 4 - Click "Ajouter un enfant" button
 * This button becomes enabled after the first child's data is filled
 * @param childNumberToAdd - The number of the child being added (2 for second child, 3 for third, etc.)
 */
export async function clickAjouterEnfant(page: Page, childNumberToAdd: number, logger?: FlowLogger): Promise<void> {
  logger?.debug('Clicking "Ajouter un enfant" button', { childNumberToAdd });

  const button = page.getByRole('button', { name: 'Ajouter un enfant' });

  // Wait for button to be visible
  await button.waitFor({ state: 'visible', timeout: AlptisTimeouts.elementVisible });

  // Wait for button to be enabled (disabled initially, enabled after first child is complete)
  await waitForButtonEnabled(button, AlptisTimeouts.buttonEnable);

  await button.click();
  logger?.debug('Button clicked, waiting for new child accordion', { childNumberToAdd });

  // Wait for the button to be disabled again (happens immediately after click)
  await waitForButtonDisabled(button, AlptisTimeouts.buttonDisable);

  // Wait for the new child accordion title to appear with the correct number
  const newChildText = `Enfant ${childNumberToAdd}`;
  await page.getByText(newChildText, { exact: true }).waitFor({ state: 'visible', timeout: AlptisTimeouts.elementVisible });

  // Small additional wait for accordion animation to complete and fields to be ready
  await page.waitForTimeout(AlptisTimeouts.accordionAnimation);

  logger?.debug('New child accordion ready', { childNumberToAdd });
}

import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';
import { SECTION_4_SELECTORS } from './selectors';
import { fillToggleField, fillDateField, fillRegimeObligatoireField } from './operations';
import { AlptisTimeouts } from '../../../../../../config';

/**
 * Section 4 - Toggle Enfants
 */
export async function fillToggleEnfants(page: Page, hasEnfants: boolean, logger?: FlowLogger): Promise<void> {
  await fillToggleField(
    page,
    hasEnfants,
    2, // Third toggle (after remplacement_contrat, conjoint)
    'Enfants toggle',
    SECTION_4_SELECTORS.toggle_enfants.primary,
    logger
  );
}

/**
 * Section 4 - Click "Ajouter un enfant" button
 */
export async function clickAjouterEnfant(page: Page, childNumber: number, logger?: FlowLogger): Promise<void> {
  logger?.debug(`Clicking "Ajouter un enfant" for child ${childNumber}`);

  const button = page.locator(SECTION_4_SELECTORS.bouton_ajouter_enfant.primary);

  // Wait for button to be enabled
  await button.waitFor({ state: 'visible', timeout: AlptisTimeouts.buttonEnable });

  await button.click();
  logger?.debug('Button clicked, waiting for accordion');

  // Wait for accordion animation
  await page.waitForTimeout(AlptisTimeouts.accordionAnimation);
}

/**
 * Section 4 - Date de naissance de l'enfant
 * @param childIndex - 0-based index of the child (0 = first child, 1 = second child, etc.)
 */
export async function fillEnfantDateNaissance(
  page: Page,
  dateNaissance: string,
  childIndex: number,
  logger?: FlowLogger
): Promise<void> {
  // Date field indices depend on whether conjoint is visible
  // Check how many date fields are visible
  const dateSelector = "input[placeholder='Ex : 01/01/2020']";
  const visibleDateFields = await page.locator(dateSelector).count();

  // If 4+ date fields: date_effet, adherent, conjoint, enfants...
  // If 3 date fields: date_effet, adherent, enfants...
  const hasConjoint = visibleDateFields >= 4;

  // For children, the date field is always the last open accordion
  // When adding new child, previous children become closed accordions
  // So the field index for the current child is always fixed based on visibility
  const baseIndex = hasConjoint ? 3 : 2;
  const dateFieldIndex = baseIndex + childIndex;

  await fillDateField(
    page,
    dateNaissance,
    dateFieldIndex,
    `[Enfant ${childIndex + 1}] Date de naissance`,
    logger
  );
}

/**
 * Section 4 - Régime obligatoire de l'enfant
 * @param childIndex - 0-based index of the child
 */
export async function fillEnfantRegimeObligatoire(
  page: Page,
  value: string,
  childIndex: number,
  logger?: FlowLogger
): Promise<void> {
  // For children regime, always use fieldIndex 0 since we target the placeholder text directly
  // The fillRegimeObligatoireField function uses page.getByText('Sélectionner un régime obligatoire').first()
  // which will find the first unfilled regime dropdown (the child's regime)
  // because the adherent's regime is already auto-filled and won't have this placeholder text

  await fillRegimeObligatoireField(
    page,
    value,
    childIndex, // Use childIndex for verification purposes
    `[Enfant ${childIndex + 1}] Régime obligatoire`,
    SECTION_4_SELECTORS.regime_obligatoire.primary,
    logger
  );
}

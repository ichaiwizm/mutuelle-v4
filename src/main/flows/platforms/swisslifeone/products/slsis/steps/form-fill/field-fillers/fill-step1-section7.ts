import type { Frame } from '@playwright/test';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';
import { fillTextboxField } from '../operations/TextboxOperations';
import { SWISSLIFE_STEP1_SELECTORS } from '../selectors';
import { SwissLifeOneTimeouts } from '../../../../../../../config';
import { mapGammeToFormLabel } from '../mappers/gamme-form-mapper';
import type { GammesOptionsData } from '../../../transformers/types';

/**
 * Fill "Gamme/Produit Santé" field (Step 1, Section 7)
 */
export async function fillGamme(
  frame: Frame,
  gamme: GammesOptionsData['gamme'],
  logger?: FlowLogger
): Promise<void> {
  const label = mapGammeToFormLabel(gamme);

  logger?.debug('Filling gamme', { label, field: '1/5', selector: SWISSLIFE_STEP1_SELECTORS.section7.gamme.primary });

  const selectElement = frame.locator(SWISSLIFE_STEP1_SELECTORS.section7.gamme.primary).first();
  await selectElement.waitFor({ state: 'visible', timeout: 10000 });

  logger?.debug('Element visible, selecting option', { label });
  await selectElement.selectOption({ label });

  // Verify selection
  const selectedValue = await selectElement.inputValue();
  logger?.debug('Option selected', { label, selectedValue });

  await frame.waitForTimeout(2000); // Wait for conditional fields to appear

  logger?.debug('Gamme selected successfully', { label });
}

/**
 * Fill "Date d'effet" field (Step 1, Section 7)
 * Note: Has datepicker, minimum 5 days in the future (enforced by transformer)
 */
export async function fillDateEffet(
  frame: Frame,
  dateEffet: string,
  logger?: FlowLogger
): Promise<void> {
  logger?.debug('Filling date effet', { dateEffet, field: '2/5' });

  await fillTextboxField(
    frame,
    SWISSLIFE_STEP1_SELECTORS.section7.date_effet.primary,
    dateEffet,
    {
      fieldLabel: 'Date d\'effet',
      fieldNumber: 2,
      totalFields: 5,
    },
    logger
  );

  // Close the datepicker if it's open
  const datepicker = frame.locator('#ui-datepicker-div');
  const isVisible = await datepicker.isVisible().catch(() => false);

  if (isVisible) {
    await frame.locator('body').click({ position: { x: 10, y: 10 } });
    await datepicker.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
      logger?.warn('Datepicker still visible after click');
    });
    await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);
  }

  logger?.debug('Date effet filled', { dateEffet });
}

/**
 * Fill "Loi Madelin" checkbox (Step 1, Section 7)
 * Only applicable for TNS regime
 */
export async function fillLoiMadelin(
  frame: Frame,
  loiMadelin: boolean,
  logger?: FlowLogger
): Promise<void> {
  logger?.debug('Filling Loi Madelin', {
    loiMadelin: loiMadelin ? 'checked' : 'unchecked',
    field: '3/5',
    checkboxName: SWISSLIFE_STEP1_SELECTORS.section7.loi_madelin.byRole
  });

  const checkbox = frame.getByRole('checkbox', { name: SWISSLIFE_STEP1_SELECTORS.section7.loi_madelin.byRole });
  await checkbox.waitFor({ state: 'visible', timeout: 10000 });

  const currentState = await checkbox.isChecked();
  logger?.debug('Checkbox found and visible', { currentState, targetState: loiMadelin });

  // Use JavaScript to set checkbox state directly (bypasses viewport issues)
  await checkbox.evaluate((el: HTMLInputElement, value: boolean) => {
    el.checked = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('click', { bubbles: true }));
  }, loiMadelin);

  // Verify checkbox state after setting
  const isCheckedAfter = await checkbox.isChecked();
  logger?.debug('Checkbox state updated', { isCheckedAfter });

  await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);
  logger?.debug('Loi Madelin filled', { loiMadelin });
}

/**
 * Fill "Reprise de concurrence à iso garanties" radio group (Step 1, Section 7)
 * IMPORTANT: This field appears dynamically after gamme selection
 */
export async function fillRepriseIsoGaranties(
  frame: Frame,
  repriseIsoGaranties: boolean,
  logger?: FlowLogger
): Promise<void> {
  const value = repriseIsoGaranties ? 'oui' : 'non';
  logger?.debug('Filling reprise iso garanties', { value, field: '4/5' });

  // Wait for the radio group to appear (it's conditional on gamme selection)
  logger?.debug('Waiting for reprise iso garanties field to load...');

  // Wait a bit longer for the field to fully load after gamme selection
  await frame.waitForTimeout(3000);

  logger?.debug('Using getByText approach with nth(2) for third oui/non group');

  // Use nth(2) to select the correct radio group (3rd set of oui/non radios on the page)
  // First set: besoin_couverture_individuelle, Second set: besoin_indemnites_journalieres, Third set: reprise_iso_garanties
  const radioLabel = frame.getByText(value, { exact: true }).nth(2);
  const count = await frame.getByText(value, { exact: true }).count();
  logger?.debug('Text elements found', { value, count });

  await radioLabel.waitFor({ state: 'visible', timeout: 10000 });
  logger?.debug('Radio label found and visible, clicking...');

  await radioLabel.click();

  await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);

  logger?.debug('Reprise iso garanties filled', { value });
}

/**
 * Fill "Résiliation à effectuer" radio group (Step 1, Section 7)
 */
export async function fillResiliationAEffectuer(
  frame: Frame,
  resiliationAEffectuer: boolean,
  logger?: FlowLogger
): Promise<void> {
  const value = resiliationAEffectuer ? 'oui' : 'non';
  logger?.debug('Filling résiliation à effectuer', { value, field: '5/5' });

  logger?.debug('Using getByText approach with nth(3) for fourth oui/non group');

  // Use nth(3) to select the correct radio group (4th set of oui/non radios)
  const radioLabel = frame.getByText(value, { exact: true }).nth(3);
  const count = await frame.getByText(value, { exact: true }).count();
  logger?.debug('Text elements found', { value, count });

  await radioLabel.waitFor({ state: 'visible', timeout: 10000 });
  logger?.debug('Radio label found and visible, clicking...');

  await radioLabel.click();

  await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);

  logger?.debug('Résiliation à effectuer filled', { value });
}

/**
 * Fill complete Section 7: Gammes et Options
 * Fills: gamme, date_effet, loi_madelin, reprise_iso_garanties, resiliation_a_effectuer
 * This is the final section of Step 1
 */
export async function fillSection7(
  frame: Frame,
  gammesOptions: GammesOptionsData,
  logger?: FlowLogger
): Promise<void> {
  logger?.debug('Starting Section 7: Gammes et Options');

  await fillGamme(frame, gammesOptions.gamme, logger);
  await fillDateEffet(frame, gammesOptions.date_effet, logger);

  // Loi Madelin checkbox only appears for TNS regimes
  // Check if the checkbox exists before trying to fill it
  const loiMadelinCheckbox = frame.getByRole('checkbox', { name: SWISSLIFE_STEP1_SELECTORS.section7.loi_madelin.byRole });
  const loiMadelinExists = await loiMadelinCheckbox.count() > 0;

  if (loiMadelinExists) {
    logger?.debug('Loi Madelin checkbox found, filling...');
    await fillLoiMadelin(frame, gammesOptions.loi_madelin, logger);
  } else {
    logger?.debug('Loi Madelin checkbox not present (non-TNS regime), skipping');
  }

  await fillRepriseIsoGaranties(frame, gammesOptions.reprise_iso_garanties, logger);
  await fillResiliationAEffectuer(frame, gammesOptions.resiliation_a_effectuer, logger);

  logger?.debug('Verification: Final checks for Section 7');

  // Verify gamme
  const gammeValue = await frame.locator(SWISSLIFE_STEP1_SELECTORS.section7.gamme.primary).first().inputValue();
  logger?.debug('Verification: Gamme value', { gammeValue });

  // Verify date effet
  const dateEffetValue = await frame.locator(SWISSLIFE_STEP1_SELECTORS.section7.date_effet.primary).inputValue();
  logger?.debug('Verification: Date effet value', { dateEffetValue });

  // Verify loi madelin checkbox
  const loiMadelinChecked = await frame.getByRole('checkbox', { name: SWISSLIFE_STEP1_SELECTORS.section7.loi_madelin.byRole }).isChecked();
  logger?.debug('Verification: Loi Madelin checked', { loiMadelinChecked });

  logger?.info('Section "Gammes et Options" completed', { section: 'gammes_options', fieldsCount: 5 });
  logger?.info('STEP 1 COMPLETE - All sections filled!');
}

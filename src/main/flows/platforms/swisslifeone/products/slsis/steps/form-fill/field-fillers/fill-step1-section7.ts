import type { Frame } from '@playwright/test';
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
  gamme: GammesOptionsData['gamme']
): Promise<void> {
  const label = mapGammeToFormLabel(gamme);

  console.log(`[1/5] Gamme: ${label}`);
  console.log(`[DEBUG] Selector: ${SWISSLIFE_STEP1_SELECTORS.section7.gamme.primary}`);

  const selectElement = frame.locator(SWISSLIFE_STEP1_SELECTORS.section7.gamme.primary).first();
  await selectElement.waitFor({ state: 'visible', timeout: 10000 });

  console.log(`[DEBUG] Element visible, attempting to select option: ${label}`);
  await selectElement.selectOption({ label });

  // Verify selection
  const selectedValue = await selectElement.inputValue();
  console.log(`[DEBUG] Selected value after selection: ${selectedValue}`);

  await frame.waitForTimeout(2000); // Wait for conditional fields to appear

  console.log(`✅ Gamme sélectionnée: ${label}`);
}

/**
 * Fill "Date d'effet" field (Step 1, Section 7)
 * Note: Has datepicker, minimum 5 days in the future (enforced by transformer)
 */
export async function fillDateEffet(
  frame: Frame,
  dateEffet: string
): Promise<void> {
  console.log(`[2/5] Date d'effet: ${dateEffet}`);

  await fillTextboxField(
    frame,
    SWISSLIFE_STEP1_SELECTORS.section7.date_effet.primary,
    dateEffet,
    {
      fieldLabel: 'Date d\'effet',
      fieldNumber: 2,
      totalFields: 5,
    }
  );

  // Close the datepicker if it's open
  const datepicker = frame.locator('#ui-datepicker-div');
  const isVisible = await datepicker.isVisible().catch(() => false);

  if (isVisible) {
    await frame.locator('body').click({ position: { x: 10, y: 10 } });
    await datepicker.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
      console.log('⚠️  Datepicker still visible after click');
    });
    await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);
  }

  console.log(`✅ Date d'effet remplie: ${dateEffet}`);
}

/**
 * Fill "Loi Madelin" checkbox (Step 1, Section 7)
 * Only applicable for TNS regime
 */
export async function fillLoiMadelin(
  frame: Frame,
  loiMadelin: boolean
): Promise<void> {
  console.log(`[3/5] Loi Madelin: ${loiMadelin ? 'oui (coché)' : 'non (décoché)'}`);
  console.log(`[DEBUG] Searching for checkbox with name: ${SWISSLIFE_STEP1_SELECTORS.section7.loi_madelin.byRole}`);

  const checkbox = frame.getByRole('checkbox', { name: SWISSLIFE_STEP1_SELECTORS.section7.loi_madelin.byRole });
  await checkbox.waitFor({ state: 'visible', timeout: 10000 });

  console.log(`[DEBUG] Checkbox found and visible, current state: ${await checkbox.isChecked()}`);
  console.log(`[DEBUG] Setting checkbox to: ${loiMadelin}`);

  // Use JavaScript to set checkbox state directly (bypasses viewport issues)
  await checkbox.evaluate((el: HTMLInputElement, value: boolean) => {
    el.checked = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('click', { bubbles: true }));
  }, loiMadelin);

  // Verify checkbox state after setting
  const isCheckedAfter = await checkbox.isChecked();
  console.log(`[DEBUG] Checkbox state after setting: ${isCheckedAfter}`);

  await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);
  console.log(`✅ Loi Madelin ${loiMadelin ? 'cochée' : 'décochée'}`);
}

/**
 * Fill "Reprise de concurrence à iso garanties" radio group (Step 1, Section 7)
 * IMPORTANT: This field appears dynamically after gamme selection
 */
export async function fillRepriseIsoGaranties(
  frame: Frame,
  repriseIsoGaranties: boolean
): Promise<void> {
  const value = repriseIsoGaranties ? 'oui' : 'non';
  console.log(`[4/5] Reprise iso garanties: ${value}`);

  // Wait for the radio group to appear (it's conditional on gamme selection)
  console.log('⏳ Attente du chargement du champ "Reprise iso garanties"...');

  // Wait a bit longer for the field to fully load after gamme selection
  await frame.waitForTimeout(3000);

  console.log(`[DEBUG] Using getByText approach with nth(2) for third oui/non group`);

  // Use nth(2) to select the correct radio group (3rd set of oui/non radios on the page)
  // First set: besoin_couverture_individuelle, Second set: besoin_indemnites_journalieres, Third set: reprise_iso_garanties
  const radioLabel = frame.getByText(value, { exact: true }).nth(2);
  const count = await frame.getByText(value, { exact: true }).count();
  console.log(`[DEBUG] Total "${value}" text elements found: ${count}`);

  await radioLabel.waitFor({ state: 'visible', timeout: 10000 });
  console.log(`[DEBUG] Radio label found and visible, clicking...`);

  await radioLabel.click();

  await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);

  console.log(`✅ Reprise iso garanties: ${value}`);
}

/**
 * Fill "Résiliation à effectuer" radio group (Step 1, Section 7)
 */
export async function fillResiliationAEffectuer(
  frame: Frame,
  resiliationAEffectuer: boolean
): Promise<void> {
  const value = resiliationAEffectuer ? 'oui' : 'non';
  console.log(`[5/5] Résiliation à effectuer: ${value}`);

  console.log(`[DEBUG] Using getByText approach with nth(3) for fourth oui/non group`);

  // Use nth(3) to select the correct radio group (4th set of oui/non radios)
  const radioLabel = frame.getByText(value, { exact: true }).nth(3);
  const count = await frame.getByText(value, { exact: true }).count();
  console.log(`[DEBUG] Total "${value}" text elements found: ${count}`);

  await radioLabel.waitFor({ state: 'visible', timeout: 10000 });
  console.log(`[DEBUG] Radio label found and visible, clicking...`);

  await radioLabel.click();

  await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);

  console.log(`✅ Résiliation à effectuer: ${value}`);
}

/**
 * Fill complete Section 7: Gammes et Options
 * Fills: gamme, date_effet, loi_madelin, reprise_iso_garanties, resiliation_a_effectuer
 * This is the final section of Step 1
 */
export async function fillSection7(
  frame: Frame,
  gammesOptions: GammesOptionsData
): Promise<void> {
  console.log('\n--- Section 7: Gammes et Options ---');

  await fillGamme(frame, gammesOptions.gamme);
  await fillDateEffet(frame, gammesOptions.date_effet);

  // Loi Madelin checkbox only appears for TNS regimes
  // Check if the checkbox exists before trying to fill it
  const loiMadelinCheckbox = frame.getByRole('checkbox', { name: SWISSLIFE_STEP1_SELECTORS.section7.loi_madelin.byRole });
  const loiMadelinExists = await loiMadelinCheckbox.count() > 0;

  if (loiMadelinExists) {
    console.log(`[DEBUG] Loi Madelin checkbox found, filling...`);
    await fillLoiMadelin(frame, gammesOptions.loi_madelin);
  } else {
    console.log(`ℹ️  Loi Madelin checkbox not present (non-TNS regime), skipping`);
  }

  await fillRepriseIsoGaranties(frame, gammesOptions.reprise_iso_garanties);
  await fillResiliationAEffectuer(frame, gammesOptions.resiliation_a_effectuer);

  console.log('\n[VERIFICATION] Vérification finale des champs de la Section 7...');

  // Verify gamme
  const gammeValue = await frame.locator(SWISSLIFE_STEP1_SELECTORS.section7.gamme.primary).first().inputValue();
  console.log(`[VERIFICATION] Gamme value: "${gammeValue}"`);

  // Verify date effet
  const dateEffetValue = await frame.locator(SWISSLIFE_STEP1_SELECTORS.section7.date_effet.primary).inputValue();
  console.log(`[VERIFICATION] Date effet value: "${dateEffetValue}"`);

  // Verify loi madelin checkbox
  const loiMadelinChecked = await frame.getByRole('checkbox', { name: SWISSLIFE_STEP1_SELECTORS.section7.loi_madelin.byRole }).isChecked();
  console.log(`[VERIFICATION] Loi Madelin checked: ${loiMadelinChecked}`);

  console.log('✅ Section "Gammes et Options" complétée (5/5 champs)');
  console.log('---\n');
  console.log('🎉 STEP 1 COMPLET - Toutes les sections remplies !');
}

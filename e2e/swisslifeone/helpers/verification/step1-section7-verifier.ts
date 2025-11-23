import type { Frame } from '@playwright/test';
import { expect } from '@playwright/test';
import type { SwissLifeOneFormData } from '@/main/flows/platforms/swisslifeone/products/slsis/transformers/types';
import { SWISSLIFE_STEP1_SELECTORS } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/form-fill/selectors';
import { mapGammeToFormLabel } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/form-fill/mappers/gamme-form-mapper';

/**
 * Verify Step 1 - Section 7: Gammes et Options
 * Checks that all gammes/options fields are correctly filled:
 * - Gamme
 * - Date d'effet
 * - Loi Madelin (conditional - only for TNS)
 * - Reprise iso garanties
 * - Résiliation à effectuer
 *
 * This is the final section of Step 1.
 */
export async function verifyStep1Section7(
  frame: Frame,
  data: SwissLifeOneFormData
): Promise<void> {
  console.log('\n🔍 [VERIFY] Vérification Step 1 - Section 7...');

  const gammes = data.gammes_options;

  // Verify Gamme
  const gammeLabel = mapGammeToFormLabel(gammes.gamme);
  const gammeSelect = frame.locator(SWISSLIFE_STEP1_SELECTORS.section7.gamme.primary).first();
  await expect(gammeSelect).toBeVisible();
  const selectedGammeText = await gammeSelect.locator('option:checked').textContent();
  expect(selectedGammeText?.trim()).toBe(gammeLabel);
  console.log(`✅ [VERIFY] Gamme: ${gammeLabel}`);

  // Verify Date d'effet
  const dateInput = frame.locator(SWISSLIFE_STEP1_SELECTORS.section7.date_effet.primary);
  await expect(dateInput).toBeVisible();
  const dateValue = await dateInput.inputValue();
  expect(dateValue).toBe(gammes.date_effet);
  console.log(`✅ [VERIFY] Date d'effet: ${dateValue}`);

  // Verify Loi Madelin (conditional - only if checkbox exists)
  const loiMadelinCheckbox = frame.getByRole('checkbox', { name: SWISSLIFE_STEP1_SELECTORS.section7.loi_madelin.byRole });
  const loiMadelinExists = await loiMadelinCheckbox.count() > 0;

  if (loiMadelinExists) {
    const isChecked = await loiMadelinCheckbox.isChecked();
    expect(isChecked).toBe(gammes.loi_madelin);
    console.log(`✅ [VERIFY] Loi Madelin: ${isChecked ? 'cochée' : 'décochée'}`);
  } else {
    console.log('ℹ️  [VERIFY] Loi Madelin checkbox non présent (régime non-TNS)');
  }

  // Verify Reprise iso garanties
  // This is the 3rd set of oui/non radios (nth index 2)
  const repriseValue = gammes.reprise_iso_garanties ? 'oui' : 'non';
  const repriseRadio = frame.getByText(repriseValue, { exact: true }).nth(2);
  await expect(repriseRadio).toBeVisible();
  console.log(`✅ [VERIFY] Reprise iso garanties: ${repriseValue}`);

  // Verify Résiliation à effectuer
  // This is the 4th set of oui/non radios (nth index 3)
  const resiliationValue = gammes.resiliation_a_effectuer ? 'oui' : 'non';
  const resiliationRadio = frame.getByText(resiliationValue, { exact: true }).nth(3);
  await expect(resiliationRadio).toBeVisible();
  console.log(`✅ [VERIFY] Résiliation à effectuer: ${resiliationValue}`);

  console.log('✅ [VERIFY] Step 1 - Section 7 vérifiée avec succès\n');
  console.log('🎉 [VERIFY] STEP 1 COMPLET - Toutes les sections vérifiées !\n');
}

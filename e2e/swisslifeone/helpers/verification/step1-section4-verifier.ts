import type { Frame } from '@playwright/test';
import { expect } from '@playwright/test';
import type { SwissLifeOneFormData } from '@/main/flows/platforms/swisslifeone/products/slsis/transformers/types';
import { SWISSLIFE_STEP1_SELECTORS } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/form-fill/selectors';
import { mapRegimeSocialToFormLabel } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/form-fill/mappers/regime-social-form-mapper';
import { mapProfessionToFormLabel } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/form-fill/mappers/profession-form-mapper';
import { mapStatutToFormLabel } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/form-fill/mappers/statut-form-mapper';

/**
 * Verify Step 1 - Section 4: Données de l'assuré principal
 * Checks that all assuré principal fields are correctly filled:
 * - Date de naissance
 * - Département de résidence
 * - Régime social
 * - Profession
 * - Statut
 */
export async function verifyStep1Section4(
  frame: Frame,
  data: SwissLifeOneFormData
): Promise<void> {
  console.log('\n🔍 [VERIFY] Vérification Step 1 - Section 4...');

  const assure = data.assure_principal;

  // Verify Date de naissance
  const dateInput = frame.locator(SWISSLIFE_STEP1_SELECTORS.section4.date_naissance_assure_principal.primary);
  await expect(dateInput).toBeVisible();
  const dateValue = await dateInput.inputValue();
  expect(dateValue).toBe(assure.date_naissance);
  console.log(`✅ [VERIFY] Date de naissance: ${dateValue}`);

  // Verify Département de résidence
  const deptSelect = frame.locator(SWISSLIFE_STEP1_SELECTORS.section4.departement_assure_principal.primary).first();
  await expect(deptSelect).toBeVisible();
  const deptValue = await deptSelect.inputValue();
  expect(deptValue).toBe(assure.departement_residence);
  console.log(`✅ [VERIFY] Département: ${deptValue}`);

  // Verify Régime social
  const regimeLabel = mapRegimeSocialToFormLabel(assure.regime_social);
  const regimeSelect = frame.locator(SWISSLIFE_STEP1_SELECTORS.section4.regime_social_assure_principal.primary).first();
  await expect(regimeSelect).toBeVisible();
  const selectedRegimeText = await regimeSelect.locator('option:checked').textContent();
  expect(selectedRegimeText?.trim()).toBe(regimeLabel);
  console.log(`✅ [VERIFY] Régime social: ${regimeLabel}`);

  // Verify Profession
  const professionLabel = mapProfessionToFormLabel(assure.profession);
  const professionSelect = frame.locator(SWISSLIFE_STEP1_SELECTORS.section4.profession_assure_principal.primary).first();
  await expect(professionSelect).toBeVisible();
  const selectedProfessionText = await professionSelect.locator('option:checked').textContent();
  expect(selectedProfessionText?.trim()).toBe(professionLabel);
  console.log(`✅ [VERIFY] Profession: ${professionLabel}`);

  // Verify Statut
  const statutLabel = mapStatutToFormLabel(assure.statut, assure.regime_social);
  const statutSelect = frame.locator(SWISSLIFE_STEP1_SELECTORS.section4.statut_assure_principal.primary).first();
  await expect(statutSelect).toBeVisible();
  const selectedStatutText = await statutSelect.locator('option:checked').textContent();
  expect(selectedStatutText?.trim()).toBe(statutLabel);
  console.log(`✅ [VERIFY] Statut: ${statutLabel}`);

  console.log('✅ [VERIFY] Step 1 - Section 4 vérifiée avec succès\n');
}

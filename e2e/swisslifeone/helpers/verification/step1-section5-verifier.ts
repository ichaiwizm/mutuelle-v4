import type { Frame } from '@playwright/test';
import { expect } from '@playwright/test';
import type { SwissLifeOneFormData } from '@/main/flows/platforms/swisslifeone/products/slsis/transformers/types';
import { SWISSLIFE_STEP1_SELECTORS } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/form-fill/selectors';
import { mapRegimeSocialToFormLabel } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/form-fill/mappers/regime-social-form-mapper';
import { mapProfessionToFormLabel } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/form-fill/mappers/profession-form-mapper';
import { mapStatutToFormLabel } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/form-fill/mappers/statut-form-mapper';

/**
 * Verify Step 1 - Section 5: Données du conjoint
 * Checks that all conjoint fields are correctly filled:
 * - Date de naissance
 * - Régime social
 * - Profession
 * - Statut
 *
 * Skips verification if no conjoint data is present.
 */
export async function verifyStep1Section5(
  frame: Frame,
  data: SwissLifeOneFormData
): Promise<void> {
  console.log('\n🔍 [VERIFY] Vérification Step 1 - Section 5...');

  if (!data.conjoint) {
    console.log('⏭️  [VERIFY] Pas de conjoint, Section 5 ignorée\n');
    return;
  }

  const conjoint = data.conjoint;

  // First, verify we're on the Conjoint tab
  const conjointTab = frame.getByRole('link', { name: SWISSLIFE_STEP1_SELECTORS.section5.conjoint_tab.primary });
  await expect(conjointTab).toBeVisible();
  console.log('✅ [VERIFY] Onglet Conjoint visible');

  // Verify Date de naissance
  const dateInput = frame.locator(SWISSLIFE_STEP1_SELECTORS.section5.date_naissance_conjoint.primary);
  await expect(dateInput).toBeVisible();
  const dateValue = await dateInput.inputValue();
  expect(dateValue).toBe(conjoint.date_naissance);
  console.log(`✅ [VERIFY] Date de naissance conjoint: ${dateValue}`);

  // Verify Régime social
  const regimeLabel = mapRegimeSocialToFormLabel(conjoint.regime_social);
  const regimeSelect = frame.locator(SWISSLIFE_STEP1_SELECTORS.section5.regime_social_conjoint.primary).first();
  await expect(regimeSelect).toBeVisible();
  const selectedRegimeText = await regimeSelect.locator('option:checked').textContent();
  expect(selectedRegimeText?.trim()).toBe(regimeLabel);
  console.log(`✅ [VERIFY] Régime social conjoint: ${regimeLabel}`);

  // Verify Profession
  const professionLabel = mapProfessionToFormLabel(conjoint.profession);
  const professionSelect = frame.locator(SWISSLIFE_STEP1_SELECTORS.section5.profession_conjoint.primary).first();
  await expect(professionSelect).toBeVisible();
  const selectedProfessionText = await professionSelect.locator('option:checked').textContent();
  expect(selectedProfessionText?.trim()).toBe(professionLabel);
  console.log(`✅ [VERIFY] Profession conjoint: ${professionLabel}`);

  // Verify Statut
  const statutLabel = mapStatutToFormLabel(conjoint.statut, conjoint.regime_social);
  const statutSelect = frame.locator(SWISSLIFE_STEP1_SELECTORS.section5.statut_conjoint.primary).first();
  await expect(statutSelect).toBeVisible();
  const selectedStatutText = await statutSelect.locator('option:checked').textContent();
  expect(selectedStatutText?.trim()).toBe(statutLabel);
  console.log(`✅ [VERIFY] Statut conjoint: ${statutLabel}`);

  console.log('✅ [VERIFY] Step 1 - Section 5 vérifiée avec succès\n');
}

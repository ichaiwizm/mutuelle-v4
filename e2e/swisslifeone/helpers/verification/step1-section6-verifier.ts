import type { Frame } from '@playwright/test';
import { expect } from '@playwright/test';
import type { SwissLifeOneFormData } from '@/main/flows/platforms/swisslifeone/products/slsis/transformers/types';
import { SWISSLIFE_STEP1_SELECTORS } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/form-fill/selectors';
import { mapAyantDroitToFormLabel } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/form-fill/mappers/ayant-droit-form-mapper';

/**
 * Verify Step 1 - Section 6: Enfants
 * Checks that:
 * - Nombre d'enfants is correctly selected
 * - If children exist, verifies each child's data (date_naissance, ayant_droit)
 *
 * Handles both cases: no children (0) and with children (1+)
 */
export async function verifyStep1Section6(
  frame: Frame,
  data: SwissLifeOneFormData
): Promise<void> {
  console.log('\n🔍 [VERIFY] Vérification Step 1 - Section 6...');

  const nombreEnfants = data.enfants?.nombre_enfants || 0;

  // Verify Nombre d'enfants selector
  const nombreEnfantsSelect = frame.locator(SWISSLIFE_STEP1_SELECTORS.section6.nombre_enfants.primary).first();
  await expect(nombreEnfantsSelect).toBeVisible();
  const selectedNombre = await nombreEnfantsSelect.inputValue();
  expect(selectedNombre).toBe(nombreEnfants.toString());
  console.log(`✅ [VERIFY] Nombre d'enfants: ${nombreEnfants}`);

  // If no children, we're done
  if (nombreEnfants === 0 || !data.enfants) {
    console.log('⏭️  [VERIFY] Aucun enfant, vérification terminée\n');
    return;
  }

  // Verify each child
  for (let i = 0; i < data.enfants.liste.length; i++) {
    const enfant = data.enfants.liste[i];
    console.log(`\n🔍 [VERIFY] Vérification Enfant ${i + 1}/${nombreEnfants}...`);

    // Verify Date de naissance
    const dateSelector = SWISSLIFE_STEP1_SELECTORS.section6.enfant_date_naissance(i);
    const dateInput = frame.locator(dateSelector).first();
    await expect(dateInput).toBeVisible();
    const dateValue = await dateInput.inputValue();
    expect(dateValue).toBe(enfant.date_naissance);
    console.log(`✅ [VERIFY] Date de naissance enfant ${i + 1}: ${dateValue}`);

    // Verify Ayant droit
    const ayantDroitLabel = mapAyantDroitToFormLabel(enfant.ayant_droit);
    const ayantDroitSelector = SWISSLIFE_STEP1_SELECTORS.section6.enfant_ayant_droit(i);
    const ayantDroitSelect = frame.locator(ayantDroitSelector).first();
    await expect(ayantDroitSelect).toBeVisible();
    const selectedAyantDroitText = await ayantDroitSelect.locator('option:checked').textContent();
    expect(selectedAyantDroitText?.trim()).toBe(ayantDroitLabel);
    console.log(`✅ [VERIFY] Ayant droit enfant ${i + 1}: ${ayantDroitLabel}`);

    console.log(`✅ [VERIFY] Enfant ${i + 1} vérifié avec succès`);
  }

  console.log('\n✅ [VERIFY] Step 1 - Section 6 vérifiée avec succès\n');
}

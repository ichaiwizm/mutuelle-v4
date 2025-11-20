import type { Frame } from '@playwright/test';
import { expect } from '@playwright/test';
import type { SwissLifeOneFormData } from '@/main/flows/platforms/swisslifeone/products/slsis/transformers/types';

/**
 * Verify Step 1 - Section 1: Nom du projet
 * Checks that the project name field is correctly filled
 */
export async function verifyStep1Section1(
  frame: Frame,
  data: SwissLifeOneFormData
): Promise<void> {
  console.log('\n🔍 [VERIFY] Vérification Step 1 - Section 1...');

  const nomProjetInput = frame.locator("input[type='text']").first();

  await expect(nomProjetInput).toBeVisible();

  const actualValue = await nomProjetInput.inputValue();
  expect(actualValue).toBe(data.projet.nom_projet);
  console.log(`✅ [VERIFY] Nom du projet: "${actualValue}"`);

  await expect(nomProjetInput).not.toBeFocused();
  console.log('✅ [VERIFY] Nom du projet input blur: OK');

  console.log('✅ [VERIFY] Step 1 - Section 1 vérifiée avec succès\n');
}

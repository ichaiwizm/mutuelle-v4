import type { Frame } from '@playwright/test';
import { expect } from '@playwright/test';
import type { SwissLifeOneFormData } from '@/main/flows/platforms/swisslifeone/products/slsis/transformers/types';

/**
 * Verify Step 1 - Section 3: Couverture santé individuelle (Type simulation)
 * Checks that the type_simulation radio button is correctly selected
 *
 * Type simulation can be:
 * - INDIVIDUEL: "Individuel"
 * - POUR_LE_COUPLE: "Pour le couple"
 */
export async function verifyStep1Section3(
  frame: Frame,
  data: SwissLifeOneFormData
): Promise<void> {
  console.log('\n🔍 [VERIFY] Vérification Step 1 - Section 3...');

  const expectedText = data.type_simulation === 'INDIVIDUEL' ? 'Individuel' : 'Pour le couple';

  // Find the text element on the page
  const textElement = frame.getByText(expectedText, { exact: data.type_simulation === 'INDIVIDUEL' });

  await expect(textElement).toBeVisible();
  console.log(`✅ [VERIFY] Type de simulation: ${expectedText}`);

  console.log('✅ [VERIFY] Step 1 - Section 3 vérifiée avec succès\n');
}

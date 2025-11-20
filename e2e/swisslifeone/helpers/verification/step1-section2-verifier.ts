import type { Frame } from '@playwright/test';
import { expect } from '@playwright/test';
import type { SwissLifeOneFormData } from '@/main/flows/platforms/swisslifeone/products/slsis/transformers/types';

/**
 * Verify Step 1 - Section 2: Vos projets (besoins)
 * Checks that the coverage needs radio buttons are correctly selected
 * Uses getByRole('radio') with nth index for verification
 */
export async function verifyStep1Section2(
  frame: Frame,
  data: SwissLifeOneFormData
): Promise<void> {
  console.log('\n🔍 [VERIFY] Vérification Step 1 - Section 2...');

  // Verify besoin_couverture_individuelle
  // First radio group has 2 options: oui (index 0) and non (index 1)
  const expectedCouvertureIndex = data.besoins.besoin_couverture_individuelle ? 0 : 1;
  const couvertureRadio = frame.getByRole('radio').nth(expectedCouvertureIndex);

  await expect(couvertureRadio).toBeChecked();
  const expectedCouverture = data.besoins.besoin_couverture_individuelle ? 'oui' : 'non';
  console.log(`✅ [VERIFY] Besoin couverture individuelle: ${expectedCouverture}`);

  // Verify besoin_indemnites_journalieres
  // Second radio group has 2 options: oui (index 2) and non (index 3)
  const expectedIndemnitesIndex = data.besoins.besoin_indemnites_journalieres ? 2 : 3;
  const indemnitesRadio = frame.getByRole('radio').nth(expectedIndemnitesIndex);

  await expect(indemnitesRadio).toBeChecked();
  const expectedIndemnites = data.besoins.besoin_indemnites_journalieres ? 'oui' : 'non';
  console.log(`✅ [VERIFY] Besoin indemnités journalières: ${expectedIndemnites}`);

  console.log('✅ [VERIFY] Step 1 - Section 2 vérifiée avec succès\n');
}

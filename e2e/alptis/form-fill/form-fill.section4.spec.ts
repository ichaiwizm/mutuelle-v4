import { test, expect } from '../../fixtures/alptis';
import { FormFillStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { hasAlptisCredentials } from '../../helpers/credentials';
import { verifySection4Toggle, verifySection4Enfant } from '../../helpers/formVerifiers';

test.describe('Alptis - Form Fill Section 4', () => {
  test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

  test('Remplissage et vérification de la Section 4 - Enfants complet (après Sections 1, 2 et 3)', async ({ page, formWithSection3, leadData }: any) => {
    expect(page.url()).toContain('/sante-select/informations-projet/');

    const step = new FormFillStep();

    // Only toggle enfants section if there are children
    const hasEnfants = !!leadData.enfants && leadData.enfants.length > 0;

    if (hasEnfants) {
      // Step 1: Toggle enfants ON
      await step.fillEnfantsToggle(page, true);
      expect(await step.checkForErrors(page)).toHaveLength(0);
      await verifySection4Toggle(page, true);

      // Step 2: Fill first child's data
      await step.fillEnfants(page, leadData.enfants);
      expect(await step.checkForErrors(page)).toHaveLength(0);
      await verifySection4Enfant(page, leadData.enfants[0], 0);

      console.log(`✅ Section 4 complétée pour 1/${leadData.enfants.length} enfant(s)`);
    } else {
      console.log('⏭️ Pas d\'enfants dans les données, section 4 ignorée');

      // Verify toggle is OFF by default
      await verifySection4Toggle(page, false);
    }
  });
});

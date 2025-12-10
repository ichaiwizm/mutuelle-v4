import { santeProPlusTest as test, expect } from '../../fixtures';
import { FormFillOrchestrator } from '@/main/flows/platforms/alptis/products/sante-pro-plus/steps/form-fill';
import { hasAlptisCredentials } from '../../helpers/credentials';
import { verifySection4Toggle, verifySection4Enfant } from '../../helpers/verification/sante-pro-plus';

test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

test('Section 4 - Enfants complet (après Sections 1, 2 et 3)', async ({ page, formWithSection3, leadData }) => {
  expect(page.url()).toContain('/sante-pro-plus/informations-projet/');

  const step = new FormFillOrchestrator();

  // Only toggle enfants section if there are children
  const hasEnfants = !!leadData.enfants && leadData.enfants.length > 0;

  if (hasEnfants) {
    // Step 1: Toggle enfants ON
    await step.fillEnfantsToggle(page, true);
    expect(await step.checkForErrors(page)).toHaveLength(0);
    await verifySection4Toggle(page, true);

    // Step 2: Fill all children's data
    await step.fillEnfants(page, leadData.enfants);
    expect(await step.checkForErrors(page)).toHaveLength(0);

    // Step 3: Verify the last child (only the last one has its accordion open and fields accessible)
    const lastChildIndex = leadData.enfants.length - 1;
    await verifySection4Enfant(page, leadData.enfants[lastChildIndex], lastChildIndex);
    console.log(`Enfant ${leadData.enfants.length}/${leadData.enfants.length} verifie (dernier enfant)`);

    console.log(`Section 4 completee pour ${leadData.enfants.length} enfant(s)`);
  } else {
    console.log('Pas d\'enfants dans les donnees, section 4 ignoree');

    // Verify toggle is OFF by default
    await verifySection4Toggle(page, false);
  }
});

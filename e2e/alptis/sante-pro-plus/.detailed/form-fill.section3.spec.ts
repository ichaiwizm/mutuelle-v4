import { santeProPlusTest as test, expect } from '../../fixtures';
import { FormFillOrchestrator } from '@/main/flows/platforms/alptis/products/sante-pro-plus/steps/form-fill';
import { hasAlptisCredentials } from '../../helpers/credentials';
import { verifySection3Toggle, verifySection3Conjoint } from '../../helpers/verification/sante-pro-plus';

test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

test('Section 3 - Conjoint complet (après Sections 1 et 2)', async ({ page, formWithSection2, leadData }) => {
  expect(page.url()).toContain('/sante-pro-plus/informations-projet/');

  const step = new FormFillOrchestrator();

  // Only fill conjoint section if there is conjoint data
  const hasConjoint = !!leadData.conjoint;

  if (hasConjoint) {
    // Step 1: Toggle conjoint ON
    await step.fillConjointToggle(page, true);
    expect(await step.checkForErrors(page)).toHaveLength(0);
    await verifySection3Toggle(page, true);

    // Step 2: Fill conjoint form fields (simplifié - pas de cadre_exercice)
    await step.fillConjoint(page, leadData.conjoint);
    expect(await step.checkForErrors(page)).toHaveLength(0);
    await verifySection3Conjoint(page, leadData.conjoint);
  } else {
    console.log('Pas de conjoint dans les donnees, section 3 ignoree');
  }
});

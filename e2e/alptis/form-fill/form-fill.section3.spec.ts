import { test, expect } from '../../fixtures/alptis';
import { FormFillStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { hasAlptisCredentials } from '../../helpers/credentials';
import { verifySection3Toggle } from '../../helpers/formVerifiers';

test.describe('Alptis - Form Fill Section 3', () => {
  test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

  test('Remplissage et vérification de la Section 3 - Toggle Conjoint (après Sections 1 et 2)', async ({ page, formWithSection2, leadData }: any) => {
    expect(page.url()).toContain('/sante-select/informations-projet/');

    const step = new FormFillStep();

    // Only fill conjoint section if there is conjoint data
    const hasConjoint = !!leadData.conjoint;

    if (hasConjoint) {
      await step.fillConjointToggle(page, true);
      expect(await step.checkForErrors(page)).toHaveLength(0);
      await verifySection3Toggle(page, true);
    } else {
      console.log('⏭️ Pas de conjoint dans les données, section 3 ignorée');
    }
  });
});

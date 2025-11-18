/**
 * Test Journey complet - Alptis Santé Select
 * Teste le flow complet : Auth → Navigation → Sections 1-4
 * S'exécute 4× via les Playwright projects (random, conjoint, children, both)
 */
import { test, expect } from '../fixtures/alptis';
import { FormFillStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { hasAlptisCredentials } from '../helpers/credentials';
import {
  verifySection1,
  verifySection2,
  verifySection3Toggle,
  verifySection3Conjoint,
  verifySection4Toggle,
  verifySection4Enfant,
} from '../helpers/verification';

test.describe('🎯 Alptis Santé Select - Journey Complet', () => {
  test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

  test('Flow complet : Auth + Nav + Sections 1-4', async ({ page, formWithSection3, leadData }) => {
    // La fixture formWithSection3 a déjà fait :
    // ✅ Auth (authenticatedPage)
    // ✅ Navigation vers formulaire (formPage)
    // ✅ Section 1 remplie (formWithSection1)
    // ✅ Section 2 remplie (formWithSection2)
    // ✅ Section 3 remplie (formWithSection3)

    expect(page.url()).toContain('/sante-select/informations-projet/');

    const step = new FormFillStep();

    // Vérification des sections déjà remplies
    await test.step('Vérifier Section 1', async () => {
      await verifySection1(page, leadData);
    });

    await test.step('Vérifier Section 2', async () => {
      await verifySection2(page, leadData);
    });

    await test.step('Vérifier Section 3', async () => {
      const hasConjoint = !!leadData.conjoint;
      if (hasConjoint) {
        await verifySection3Toggle(page, true);
        await verifySection3Conjoint(page, leadData.conjoint);
      } else {
        await verifySection3Toggle(page, false);
      }
    });

    // Remplir et vérifier Section 4
    await test.step('Remplir et vérifier Section 4', async () => {
      const hasEnfants = !!leadData.enfants && leadData.enfants.length > 0;

      if (hasEnfants) {
        // Toggle enfants ON
        await step.fillEnfantsToggle(page, true);
        expect(await step.checkForErrors(page)).toHaveLength(0);
        await verifySection4Toggle(page, true);

        // Remplir les données des enfants
        await step.fillEnfants(page, leadData.enfants);
        expect(await step.checkForErrors(page)).toHaveLength(0);

        // Vérifier le dernier enfant (seul accessible)
        const lastChildIndex = leadData.enfants.length - 1;
        await verifySection4Enfant(page, leadData.enfants[lastChildIndex], lastChildIndex);
        console.log(`✅ Section 4 complétée pour ${leadData.enfants.length} enfant(s)`);
      } else {
        // Vérifier que le toggle est OFF
        await verifySection4Toggle(page, false);
        console.log('⏭️ Pas d\'enfants, Section 4 ignorée');
      }
    });

    console.log('\n🎉 Journey complet terminé avec succès !');
  });
});

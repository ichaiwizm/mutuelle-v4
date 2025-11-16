import { test, expect } from '@playwright/test';
import { AlptisAuth } from '../../src/main/flows/platforms/alptis/lib/AlptisAuth';
import { NavigationStep } from '../../src/main/flows/platforms/alptis/products/sante-select/steps/navigation';
import { FormFillStep } from '../../src/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { LeadTransformer } from '../../src/main/flows/platforms/alptis/products/sante-select/transformers/LeadTransformer';
import { getAlptisCredentials, hasAlptisCredentials } from '../helpers/credentials';
import { loadAllLeads } from '../helpers/loadLeads';
import { verifySection1, verifySection2 } from '../helpers/formVerifiers';

test.describe('Alptis - Form Fill Section 1', () => {
  test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

  test('Remplir Section 1: Mise en place du contrat - email-001', async ({ page }: { page: any }) => {
    console.log('\n📋 [TEST] Début du test - email-001');
    console.log('='.repeat(60));

    // Load test data
    const leads = loadAllLeads();
    const lead = leads[0];
    if (!lead) throw new Error('Failed to load lead from email-001');

    console.log('\n📥 [DATA] Lead chargé');
    console.log(`  ↳ Adhérent: ${lead.subscriber.prenom} ${lead.subscriber.nom}`);

    // Authentication
    console.log('\n🔐 [AUTH] Connexion...');
    const auth = new AlptisAuth(getAlptisCredentials());
    await auth.login(page);
    console.log('✅ [AUTH] Connecté');
    expect(page.url()).not.toContain('/auth/realms/');

    // Navigate to form
    console.log('\n🧭 [NAV] Navigation vers formulaire...');
    const navigationStep = new NavigationStep();
    await navigationStep.execute(page);
    console.log('✅ [NAV] Sur le formulaire');
    expect(page.url()).toContain('/sante-select/informations-projet/');

    // Transform lead data
    console.log('\n🔄 [TRANSFORM] Transformation du lead...');
    const transformedData = LeadTransformer.transform(lead);
    console.log('✅ [TRANSFORM] Lead transformé');

    // Fill Section 1
    console.log('\n📝 [FORM-FILL] Remplissage de la section 1...');
    const formFillStep = new FormFillStep();
    await formFillStep.fillMiseEnPlace(page, transformedData);

    // Verify Section 1
    const errors1 = await formFillStep.checkForErrors(page);
    expect(errors1).toHaveLength(0);
    console.log('✅ [VERIFY] Aucune erreur de validation');

    await verifySection1(page, transformedData);

    // Fill Section 2
    console.log('\n📝 [FORM-FILL] Remplissage de la section 2 (Adhérent)...');
    await formFillStep.fillAdherent(page, transformedData);

    // Verify Section 2
    const errors2 = await formFillStep.checkForErrors(page);
    expect(errors2).toHaveLength(0);
    console.log('✅ [VERIFY] Aucune erreur de validation');

    await verifySection2(page, transformedData);

    // Take screenshot
    console.log('\n📸 [SCREENSHOT] Capture d\'écran...');
    await page.screenshot({
      path: `./e2e/test-results/sections-1-2-filled-${Date.now()}.png`,
      fullPage: true,
    });
    console.log('✅ [SCREENSHOT] Screenshot sauvegardé');

    console.log('\n🎉 [TEST] Test terminé avec succès');
    console.log('='.repeat(60));
  });
});

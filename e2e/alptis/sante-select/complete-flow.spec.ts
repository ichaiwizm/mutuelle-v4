/**
 * Test du flux complet Alptis Santé Select avec les nouvelles étapes d'enregistrement
 */
import { test, expect } from '../fixtures';
import { FormFillOrchestrator } from '@/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { hasAlptisCredentials } from '../helpers/credentials';

test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

test('Flux complet avec enregistrement', async ({ page, authenticatedPage, leadData }) => {
  console.log('\n📊 Lead composition:');
  console.log(`   - Conjoint: ${leadData.conjoint ? '✓' : '✗'}`);
  console.log(`   - Enfants: ${leadData.enfants?.length || 0}`);

  // Navigation manuelle vers le formulaire
  console.log('\n🧭 Navigation vers le formulaire...');
  await page.goto('https://pro.alptis.org/sante-select/informations-projet/', { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/\/sante-select\/informations-projet/);

  const step = new FormFillOrchestrator();

  // Section 1
  console.log('\n📝 Section 1 - Mise en place...');
  await step.fillMiseEnPlace(page, leadData);

  // Section 2
  console.log('📝 Section 2 - Adhérent...');
  await step.fillAdherent(page, leadData);

  // Section 3 - Conjoint
  const hasConjoint = !!leadData.conjoint;
  if (hasConjoint) {
    console.log('📝 Section 3 - Conjoint (ON)...');
    await step.fillConjointToggle(page, true);
    await step.fillConjoint(page, leadData.conjoint);
  } else {
    console.log('📝 Section 3 - Conjoint (OFF)...');
    await step.fillConjointToggle(page, false);
  }

  // Section 4 - Enfants
  const hasEnfants = !!leadData.enfants && leadData.enfants.length > 0;
  if (hasEnfants) {
    console.log(`📝 Section 4 - Enfants (${leadData.enfants!.length})...`);
    await step.fillEnfantsToggle(page, true);
    await step.fillEnfants(page, leadData.enfants);
  } else {
    console.log('📝 Section 4 - Enfants (OFF)...');
    await step.fillEnfantsToggle(page, false);
  }

  // Submit -> Page Garanties
  console.log('\n🚀 Étape 1: Clic sur Garanties...');
  await step.submit(page);
  await expect(page).toHaveURL(/\/sante-select\/garanties/);
  console.log('   ✅ Page Garanties atteinte');

  // Enregistrer sur la page Garanties
  console.log('\n🚀 Étape 2: Clic sur Enregistrer...');
  await step.saveGaranties(page);
  console.log('   ✅ Modal de confirmation affiché');

  // Confirmer l'enregistrement
  console.log('\n🚀 Étape 3: Clic sur "Enregistrer et continuer"...');
  await step.confirmSave(page);
  console.log('   ✅ Lead enregistré avec succès!');

  // Screenshot final
  await page.screenshot({ path: 'e2e/test-results/flux-complet-termine.png', fullPage: true });
  console.log('\n📸 Screenshot sauvegardé: e2e/test-results/flux-complet-termine.png');

  console.log('\n🎉 FLUX COMPLET TERMINÉ AVEC SUCCÈS!');
});

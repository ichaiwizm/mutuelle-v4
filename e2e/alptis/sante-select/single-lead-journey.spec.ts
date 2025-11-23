/**
 * Single Lead Journey Test - Alptis Santé Select
 *
 * Test de parcours complet pour UN lead spécifique sélectionné via LEAD_INDEX.
 * Ce test s'adapte automatiquement à la composition du lead (avec/sans conjoint/enfants).
 *
 * Utilisation:
 *   LEAD_INDEX=5 playwright test e2e/alptis/sante-select/single-lead-journey.spec.ts --ui
 *   OU
 *   pnpm lead-test (qui lance ce test automatiquement)
 */
import { test, expect } from '../fixtures';
import { FormFillOrchestrator } from '@/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { hasAlptisCredentials } from '../helpers/credentials';
import { verifySection4Toggle, verifySection4Enfant } from '../helpers/verification';

test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

test('Complete journey with selected lead', async ({ page, formWithSection3, leadData }) => {
  // Les fixtures ont déjà fait : Auth + Nav + Sections 1-3
  expect(page.url()).toContain('/sante-select/informations-projet/');

  const step = new FormFillOrchestrator();

  // Section 4: Enfants (si le lead en a)
  const hasEnfants = !!leadData.enfants && leadData.enfants.length > 0;
  const hasConjoint = !!leadData.conjoint;

  // Log de la composition du lead pour debugging
  console.log('\n📊 Lead composition:');
  console.log(`   - Conjoint: ${hasConjoint ? '✓' : '✗'}`);
  console.log(`   - Enfants: ${hasEnfants ? `✓ (${leadData.enfants?.length})` : '✗'}`);

  if (hasEnfants) {
    console.log('\n📝 Filling Section 4 (Enfants)...');
    await step.fillEnfantsToggle(page, true);
    expect(await step.checkForErrors(page)).toHaveLength(0);
    await verifySection4Toggle(page, true);

    await step.fillEnfants(page, leadData.enfants);
    expect(await step.checkForErrors(page)).toHaveLength(0);

    // Verify last child
    const lastChildIndex = leadData.enfants.length - 1;
    await verifySection4Enfant(page, leadData.enfants[lastChildIndex], lastChildIndex);
    console.log(`✅ Section 4 completed for ${leadData.enfants.length} child(ren)`);
  } else {
    console.log('\n⏭️  No children, skipping Section 4');
    await verifySection4Toggle(page, false);
  }

  console.log('\n🎉 Complete journey finished successfully!');
  console.log(`   Sections completed: 1 ✓ | 2 ✓ | 3 ✓ | 4 ${hasEnfants ? '✓' : '⏭️'}`);
});

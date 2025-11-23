/**
 * Single Lead Journey Test - SwissLife One SLSIS
 *
 * Test de parcours complet pour UN lead spécifique sélectionné via LEAD_INDEX.
 * Ce test s'adapte automatiquement à la composition du lead (avec/sans conjoint/enfants).
 *
 * Utilisation:
 *   LEAD_INDEX=5 playwright test e2e/swisslifeone/slsis/single-lead-journey.spec.ts --ui
 *   OU
 *   pnpm lead-test-swisslife (si vous créez ce script)
 */
import { test, expect } from '../fixtures';
import { SwissLifeOneInstances } from '@/main/flows/registry';
import { hasSwissLifeOneCredentials } from '../helpers/credentials';

test.skip(!hasSwissLifeOneCredentials(), 'Credentials manquants dans .env');

test('Complete journey with selected lead', async ({ page, formWithStep1Section7, leadData }) => {
  test.setTimeout(180000); // 3 minutes (iframe is slow)

  // Les fixtures ont déjà fait : Auth + Nav + Sections 1-7
  expect(page.url()).toContain('/tarification-et-simulation/slsis');

  const nav = SwissLifeOneInstances.getNavigationStep();
  const frame = await nav.getIframe(page);

  // All 7 sections filled by fixture, verify no errors
  const formFill = SwissLifeOneInstances.getFormFillStep();
  const errors = await formFill.checkForErrors(frame);

  // Log de la composition du lead pour debugging
  const hasConjoint = !!leadData.conjoint;
  const hasEnfants = !!leadData.enfants && leadData.enfants.nombre_enfants > 0;

  console.log('\n📊 Lead composition:');
  console.log(`   - Projet: ${leadData.projet.nom_projet}`);
  console.log(`   - Conjoint: ${hasConjoint ? '✓' : '✗'}`);
  console.log(`   - Enfants: ${hasEnfants ? `✓ (${leadData.enfants?.nombre_enfants})` : '✗'}`);

  console.log('\n🎉 Complete journey finished successfully!');
  console.log(`   Sections completed: 1 ✓ | 2 ✓ | 3 ✓ | 4 ✓ | 5 ${hasConjoint ? '✓' : '⏭️'} | 6 ${hasEnfants ? '✓' : '⏭️'} | 7 ✓`);
  console.log(`   Errors found: ${errors.length}`);
  console.log(`   Gamme: ${leadData.gammes_options.gamme}`);

  expect(errors).toHaveLength(0);
});

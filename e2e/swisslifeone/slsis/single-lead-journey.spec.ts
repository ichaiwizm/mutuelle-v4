/**
 * Single Lead Journey Test - SwissLife One SLSIS
 *
 * Test de parcours complet pour UN lead spécifique sélectionné via LEAD_INDEX.
 *
 * MIGRATED TO FLOWENGINE: Utilise le FlowEngine pour orchestration automatique.
 *
 * Utilisation:
 *   LEAD_INDEX=5 playwright test e2e/swisslifeone/slsis/single-lead-journey.spec.ts --ui
 */
import { test, expect } from '../fixtures';
import { FlowEngine } from '@/main/flows/engine';
import { SwissLifeOneLeadTransformer } from '@/main/flows/platforms/swisslifeone/products/slsis/transformers/LeadTransformer';
import { SwissLifeOneInstances } from '@/main/flows/registry';
import { hasSwissLifeOneCredentials } from '../helpers/credentials';
import { selectLead } from '../../leads';
import {
  verifyStep1Section1,
  verifyStep1Section2,
  verifyStep1Section3,
  verifyStep1Section4,
  verifyStep1Section5,
  verifyStep1Section6,
  verifyStep1Section7,
} from '../helpers/verification';

test.skip(!hasSwissLifeOneCredentials(), 'Credentials manquants dans .env');

test('Complete journey with FlowEngine', async ({ page, authenticatedPage }) => {
  test.setTimeout(180000); // 3 minutes (iframe is slow)

  // Auth already done by fixture
  const lead = selectLead();
  const formData = SwissLifeOneLeadTransformer.transform(lead);

  const hasConjoint = !!formData.conjoint;
  const hasEnfants = (formData.enfants?.nombre_enfants ?? 0) > 0;

  // Log de la composition du lead
  console.log('\n📊 Lead composition:');
  console.log(`   - Projet: ${formData.projet.nom_projet}`);
  console.log(`   - Conjoint: ${hasConjoint ? '✓' : '✗'}`);
  console.log(`   - Enfants: ${hasEnfants ? `✓ (${formData.enfants?.nombre_enfants})` : '✗'}`);

  // Create FlowEngine and execute complete flow
  console.log('\n🚀 Executing flow with FlowEngine...');
  const engine = new FlowEngine({
    skipAuth: true,  // Already authenticated
    verbose: true,
    stopOnError: true,
  });

  const result = await engine.execute('swisslife_one_slis', {
    page,
    lead,
    transformedData: formData,
  });

  expect(result.success).toBe(true);
  console.log(`\n✅ FlowEngine completed in ${result.totalDuration}ms`);

  // Verify all sections
  console.log('\n🔍 Verifying all sections...');
  const nav = SwissLifeOneInstances.getNavigationStep();
  const frame = await nav.getIframe(page);

  await verifyStep1Section1(frame, formData);
  await verifyStep1Section2(frame, formData);
  await verifyStep1Section3(frame, formData);
  await verifyStep1Section4(frame, formData);
  await verifyStep1Section5(frame, formData);
  await verifyStep1Section6(frame, formData);
  await verifyStep1Section7(frame, formData);

  console.log('\n🎉 Complete journey finished successfully!');
  console.log(`   Sections completed: 1-7 ✓`);
});

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
import { createSwissLifeServices } from '@/main/flows/engine/services';
import type { SwissLifeNavigationStep } from '@/main/flows/platforms/swisslifeone/products/slsis/steps/navigation';
import { hasSwissLifeOneCredentials, getSwissLifeOneCredentials } from '../helpers/credentials';
import { selectLead } from '../../leads';

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

  const result = await engine.execute('swisslife_one_slsis', {
    page,
    lead,
    transformedData: formData,
  });

  expect(result.success).toBe(true);
  console.log(`\n✅ FlowEngine completed in ${result.totalDuration}ms`);

  // Verify we navigated past Step 1 (could be Step 2 "Santé" or Step 3 "Synthèse")
  console.log('\n🔍 Verifying navigation past Step 1...');
  const services = createSwissLifeServices(getSwissLifeOneCredentials());
  const nav = services.navigation as SwissLifeNavigationStep;
  const frame = await nav.getIframe(page);

  // Check for either Step 2 (#tabs-sante) or Step 3 (Cotisation)
  const isOnStep2 = await frame.locator('#tabs-sante').isVisible().catch(() => false);
  const isOnStep3 = await frame.locator('text=Cotisation').first().isVisible().catch(() => false);
  expect(isOnStep2 || isOnStep3).toBe(true);
  console.log(`   Navigated to ${isOnStep2 ? 'Step 2 (Santé)' : 'Step 3 (Synthèse)'} ✓`);

  console.log('\n🎉 Complete journey finished successfully!');
  console.log(`   All sections completed + Submit ✓`);
});

/**
 * Single Lead Journey Test - Alptis Santé Select
 *
 * Test de parcours complet pour UN lead spécifique sélectionné via LEAD_INDEX.
 * Ce test s'adapte automatiquement à la composition du lead (avec/sans conjoint/enfants).
 *
 * MIGRATED TO FLOWENGINE: Utilise le FlowEngine pour orchestration automatique.
 *
 * Utilisation:
 *   LEAD_INDEX=5 playwright test e2e/alptis/sante-select/single-lead-journey.spec.ts --ui
 *   OU
 *   pnpm lead-test (qui lance ce test automatiquement)
 */
import { test, expect } from '../fixtures';
import { FlowEngine } from '@/main/flows/engine';
import { LeadTransformer } from '@/main/flows/platforms/alptis/products/sante-select/transformers/LeadTransformer';
import { hasAlptisCredentials } from '../helpers/credentials';
import { selectLead } from '../../leads';

test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

test('Complete journey with FlowEngine', async ({ page, authenticatedPage }) => {
  // Auth already done by fixture
  const lead = selectLead();
  const leadData = LeadTransformer.transform(lead);

  const hasEnfants = !!leadData.enfants && leadData.enfants.length > 0;
  const hasConjoint = !!leadData.conjoint;

  // Log de la composition du lead
  console.log('\n📊 Lead composition:');
  console.log(`   - Conjoint: ${hasConjoint ? '✓' : '✗'}`);
  console.log(`   - Enfants: ${hasEnfants ? `✓ (${leadData.enfants?.length})` : '✗'}`);

  // Create FlowEngine and execute complete flow
  console.log('\n🚀 Executing flow with FlowEngine...');
  const engine = new FlowEngine({
    skipAuth: true,  // Already authenticated
    verbose: true,
    stopOnError: true,
  });

  const result = await engine.execute('alptis_sante_select', {
    page,
    lead,
    transformedData: leadData,
  });

  expect(result.success).toBe(true);
  console.log(`\n✅ FlowEngine completed in ${result.totalDuration}ms`);

  // Verify we navigated to Step 2 (Garanties)
  console.log('\n🔍 Verifying Garanties page...');
  // The URL should have changed or we should see "Garanties" content
  await expect(page.locator('text=Garanties').first()).toBeVisible({ timeout: 10000 });
  console.log('   Garanties page reached ✓');

  console.log('\n🎉 Complete journey finished successfully!');
  console.log(`   All sections completed + Submit ✓`);
});

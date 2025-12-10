/**
 * Single Lead Journey Test - Alptis Santé Pro Plus
 *
 * Test de parcours complet pour UN lead spécifique sélectionné via LEAD_INDEX.
 * Ce test s'adapte automatiquement à la composition du lead (avec/sans conjoint/enfants).
 *
 * MIGRATED TO FLOWENGINE: Utilise le FlowEngine pour orchestration automatique.
 *
 * Utilisation:
 *   LEAD_INDEX=5 playwright test e2e/alptis/sante-pro-plus/single-lead-journey.spec.ts --ui
 */
import { santeProPlusTest as test, expect } from '../fixtures';
import { FlowEngine } from '@/main/flows/engine';
import { LeadTransformer } from '@/main/flows/platforms/alptis/products/sante-pro-plus/transformers/LeadTransformer';
import { hasAlptisCredentials } from '../helpers/credentials';
import { selectLead } from '../../leads';

test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

test('Complete journey with FlowEngine (Santé Pro Plus)', async ({ page, authenticatedPage }) => {
  // Auth already done by fixture
  // Filtrer les leads éligibles pour Santé Pro Plus (âge 18-67 ans)
  const lead = selectLead('random', 'sante-pro-plus');
  const leadData = LeadTransformer.transform(lead);

  const hasEnfants = !!leadData.enfants && leadData.enfants.length > 0;
  const hasConjoint = !!leadData.conjoint;

  // Log de la composition du lead
  console.log('\nLead composition (Sante Pro Plus):');
  console.log(`   - Conjoint: ${hasConjoint ? 'yes' : 'no'} (note: pas de cadre_exercice)`);
  console.log(`   - Enfants: ${hasEnfants ? `yes (${leadData.enfants?.length})` : 'no'}`);
  console.log(`   - Micro-entrepreneur: ${leadData.adherent.micro_entrepreneur}`);
  console.log(`   - Ville: ${leadData.adherent.ville}`);
  if (leadData.adherent.statut_professionnel) {
    console.log(`   - Statut professionnel: ${leadData.adherent.statut_professionnel}`);
  }

  // Create FlowEngine and execute complete flow
  console.log('\nExecuting flow with FlowEngine (Sante Pro Plus)...');
  const engine = new FlowEngine({
    skipAuth: true,  // Already authenticated
    verbose: true,
    stopOnError: true,
  });

  const result = await engine.execute('alptis_sante_pro_plus', {
    page,
    lead,
    transformedData: leadData,
  });

  expect(result.success).toBe(true);
  console.log(`\nFlowEngine completed in ${result.totalDuration}ms`);

  // Verify we navigated to Step 2 (Garanties)
  console.log('\nVerifying Garanties page...');
  console.log(`   Current URL: ${page.url()}`);
  // Vérifier l'URL de la page Garanties (avec ou sans trailing slash)
  await expect(page).toHaveURL(/\/sante-pro-plus\/garanties/);
  // Vérifier le contenu spécifique de la page
  await expect(page.locator('text=Choix des garanties')).toBeVisible({ timeout: 10000 });
  console.log('   Garanties page reached');

  console.log('\nComplete journey finished successfully! (Sante Pro Plus)');
  console.log(`   All sections completed + Submit`);
});

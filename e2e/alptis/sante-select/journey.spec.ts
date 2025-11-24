/**
 * Test Journey complet - Alptis Santé Select
 * Teste le flow complet : Auth → Navigation → Sections 1-4
 *
 * MIGRATED TO FLOWENGINE: Utilise le FlowEngine pour orchestration automatique.
 */
import { test, expect } from '../fixtures';
import { FlowEngine } from '@/main/flows/engine';
import { LeadTransformer } from '@/main/flows/platforms/alptis/products/sante-select/transformers/LeadTransformer';
import { hasAlptisCredentials } from '../helpers/credentials';
import { selectLead } from '../../leads';

test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

// Helper function to execute flow with FlowEngine
async function executeFlowWithEngine(page: any) {
  const lead = selectLead();
  const leadData = LeadTransformer.transform(lead);

  const engine = new FlowEngine({
    skipAuth: true,
    verbose: true,
    stopOnError: true,
  });

  const result = await engine.execute('alptis_sante_select', {
    page,
    lead,
    transformedData: leadData,
  });

  expect(result.success).toBe(true);
  console.log(`✅ FlowEngine completed in ${result.totalDuration}ms`);

  return { result, leadData };
}

test('🎲 Random', async ({ page, authenticatedPage }) => {
  const { result, leadData } = await executeFlowWithEngine(page);

  const hasConjoint = !!leadData.conjoint;
  const hasEnfants = !!leadData.enfants && leadData.enfants.length > 0;

  console.log(`✅ Parcours complété - Conjoint: ${hasConjoint}, Enfants: ${hasEnfants ? leadData.enfants?.length : 0}`);
});

test('👫 Avec conjoint', async ({ page, authenticatedPage }) => {
  const { result, leadData } = await executeFlowWithEngine(page);

  const hasConjoint = !!leadData.conjoint;
  expect(hasConjoint).toBe(true);

  console.log('✅ Parcours avec conjoint complété');
});

test('👶 Avec enfants', async ({ page, authenticatedPage }) => {
  const { result, leadData } = await executeFlowWithEngine(page);

  const hasEnfants = !!leadData.enfants && leadData.enfants.length > 0;
  expect(hasEnfants).toBe(true);

  console.log(`✅ Parcours avec ${leadData.enfants?.length} enfant(s) complété`);
});

test('👨‍👩‍👧‍👦 Avec conjoint ET enfants', async ({ page, authenticatedPage }) => {
  const { result, leadData } = await executeFlowWithEngine(page);

  const hasConjoint = !!leadData.conjoint;
  const hasEnfants = !!leadData.enfants && leadData.enfants.length > 0;

  expect(hasConjoint).toBe(true);
  expect(hasEnfants).toBe(true);

  console.log(`✅ Parcours complet avec conjoint et ${leadData.enfants?.length} enfant(s)`);
});

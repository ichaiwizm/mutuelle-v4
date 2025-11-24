/**
 * Test Journey complet - SwissLife One SLSIS
 * Teste le flow complet : Auth → Navigation → Sections 1-7
 *
 * MIGRATED TO FLOWENGINE: Utilise le FlowEngine pour orchestration automatique.
 */
import { test, expect } from '../fixtures';
import { FlowEngine } from '@/main/flows/engine';
import { SwissLifeOneLeadTransformer } from '@/main/flows/platforms/swisslifeone/products/slsis/transformers/LeadTransformer';
import { hasSwissLifeOneCredentials } from '../helpers/credentials';
import { selectLead } from '../../leads';

test.skip(!hasSwissLifeOneCredentials(), 'Credentials manquants dans .env');

// Helper function to execute flow with FlowEngine
async function executeFlowWithEngine(page: any) {
  const lead = selectLead();
  const formData = SwissLifeOneLeadTransformer.transform(lead);

  const engine = new FlowEngine({
    skipAuth: true,
    verbose: true,
    stopOnError: true,
  });

  const result = await engine.execute('swisslife_one_slis', {
    page,
    lead,
    transformedData: formData,
  });

  expect(result.success).toBe(true);
  console.log(`✅ FlowEngine completed in ${result.totalDuration}ms`);

  return { result, formData };
}

test('🎲 Random', async ({ page, authenticatedPage }) => {
  test.setTimeout(180000);
  const { result, formData } = await executeFlowWithEngine(page);

  const hasConjoint = !!formData.conjoint;
  const hasEnfants = (formData.enfants?.nombre_enfants ?? 0) > 0;

  console.log(`✅ Parcours complété`);
});

test('🧍 Solo', async ({ page, authenticatedPage }) => {
  test.setTimeout(180000);
  const { result, formData } = await executeFlowWithEngine(page);

  const hasConjoint = !!formData.conjoint;
  const hasEnfants = (formData.enfants?.nombre_enfants ?? 0) > 0;

  expect(hasConjoint).toBe(false);
  expect(hasEnfants).toBe(false);

  console.log('✅ Parcours solo complété');
});

test('👫 Avec conjoint', async ({ page, authenticatedPage }) => {
  test.setTimeout(180000);
  const { result, formData } = await executeFlowWithEngine(page);

  const hasConjoint = !!formData.conjoint;
  expect(hasConjoint).toBe(true);

  console.log('✅ Parcours avec conjoint complété');
});

test('👶 Avec enfants', async ({ page, authenticatedPage }) => {
  test.setTimeout(180000);
  const { result, formData } = await executeFlowWithEngine(page);

  const hasEnfants = (formData.enfants?.nombre_enfants ?? 0) > 0;
  expect(hasEnfants).toBe(true);

  console.log('✅ Parcours avec enfants complété');
});

test('👨‍👩‍👧‍👦 Conjoint ET enfants', async ({ page, authenticatedPage }) => {
  test.setTimeout(180000);
  const { result, formData } = await executeFlowWithEngine(page);

  const hasConjoint = !!formData.conjoint;
  const hasEnfants = (formData.enfants?.nombre_enfants ?? 0) > 0;

  expect(hasConjoint).toBe(true);
  expect(hasEnfants).toBe(true);

  console.log('✅ Parcours complet terminé');
});

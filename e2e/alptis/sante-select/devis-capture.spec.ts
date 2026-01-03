/**
 * Devis Capture Test - Alptis Santé Select
 *
 * Tests the devis extraction from the result page after form submission.
 * Note: FlowEngine integration tests must be run within Electron context.
 *
 * Usage:
 *   LEAD_INDEX=0 npx playwright test e2e/alptis/sante-select/devis-capture.spec.ts --headed
 */
import { test, expect } from '../fixtures';
import { hasAlptisCredentials } from '../helpers/credentials';
import { FormFillOrchestrator } from '@/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { AlptisDevisExtractor } from '@/main/flows/platforms/alptis/extractors/AlptisDevisExtractor';

test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

// Longer timeout for complete flow
test.setTimeout(180000);

test('Verify devis extraction selectors', async ({ page, authenticatedPage, leadData }) => {
  /**
   * This test validates that our CSS selectors work correctly
   * by navigating to the result page and testing extraction
   */

  console.log('\n📊 Lead composition:');
  console.log(`   - Conjoint: ${leadData.conjoint ? '✓' : '✗'}`);
  console.log(`   - Enfants: ${leadData.enfants?.length || 0}`);

  // Navigate to form
  console.log('\n🧭 Navigation vers le formulaire...');
  await page.goto('https://pro.alptis.org/sante-select/informations-projet/', { waitUntil: 'networkidle' });

  const step = new FormFillOrchestrator();

  // Fill form
  console.log('\n📝 Remplissage du formulaire...');
  await step.fillMiseEnPlace(page, leadData);
  await step.fillAdherent(page, leadData);

  if (leadData.conjoint) {
    await step.fillConjointToggle(page, true);
    await step.fillConjoint(page, leadData.conjoint);
  } else {
    await step.fillConjointToggle(page, false);
  }

  if (leadData.enfants && leadData.enfants.length > 0) {
    await step.fillEnfantsToggle(page, true);
    await step.fillEnfants(page, leadData.enfants);
  } else {
    await step.fillEnfantsToggle(page, false);
  }

  // Submit
  console.log('\n🚀 Soumission...');
  await step.submit(page);
  await step.saveGaranties(page);
  await step.confirmSave(page);

  // Test extractor
  console.log('\n🔍 Testing devis extractor...');
  const extractor = new AlptisDevisExtractor();

  // Verify selectors
  const selectors = extractor.getResultPageSelectors();
  console.log('   Selectors:', selectors);

  // Extract data
  const extractedData = await extractor.extractDevisData(page);

  expect(extractedData).not.toBeNull();
  console.log('\n📋 Extracted data:');
  console.log(`   - Monthly Premium: ${extractedData?.monthlyPremium} €`);
  console.log(`   - Devis URL: ${extractedData?.devisUrl}`);
  console.log(`   - Quote Reference: ${extractedData?.quoteReference}`);

  // Verify extracted values
  expect(extractedData?.monthlyPremium).toBeGreaterThan(0);
  expect(extractedData?.devisUrl).toContain('/sante-select/projets/');

  console.log('\n✅ Selector verification completed!');
});

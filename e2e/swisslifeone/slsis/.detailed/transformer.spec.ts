import { test, expect } from '@playwright/test';
import { SwissLifeOneLeadTransformer } from '@/main/flows/platforms/swisslifeone/products/slsis/transformers/LeadTransformer';
import { loadAllLeads } from '../../../shared/helpers';
import { verifyTransformedData } from '../../helpers/transformerVerifiers';

/**
 * Tests du transformer SwissLifeOne SLSIS
 * Vérifie la transformation complète des leads (mapping, dates, sections conditionnelles)
 */
test('Transform all leads with detailed verification', () => {
  const leads = loadAllLeads();

  console.log(`\n${'='.repeat(80)}`);
  console.log(`TESTING SWISSLIFEONE TRANSFORMER WITH ${leads.length} LEADS`);
  console.log('='.repeat(80));

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ index: number; leadId: string; error: string }> = [];

  leads.forEach((lead, index) => {
    const leadNumber = index + 1;

    console.log(`\n${'='.repeat(80)}`);
    console.log(`TEST LEAD #${leadNumber}/${leads.length}`);
    console.log('='.repeat(80));

    try {
      // Transform
      const transformed = SwissLifeOneLeadTransformer.transform(lead);

      // Verify
      verifyTransformedData(transformed, lead, index);

      successCount++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Lead #${leadNumber} failed:`, errorMessage);
      errors.push({
        index: leadNumber,
        leadId: lead.id || `lead-${leadNumber}`,
        error: errorMessage,
      });
      errorCount++;
    }
  });

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('SWISSLIFEONE TRANSFORMATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Success: ${successCount}/${leads.length}`);
  console.log(`❌ Errors: ${errorCount}/${leads.length}`);

  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(({ index, leadId, error }) => {
      console.log(`  - Lead #${index} (${leadId}): ${error}`);
    });
  }

  // Assert all leads transformed successfully
  expect(errorCount).toBe(0);
  expect(successCount).toBe(leads.length);

  console.log(`\n🎉 All ${leads.length} leads transformed successfully`);
});

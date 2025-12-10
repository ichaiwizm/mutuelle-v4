import { test, expect } from '@playwright/test';
import { LeadTransformer } from '@/main/flows/platforms/alptis/products/sante-pro-plus/transformers/LeadTransformer';
import { loadAllLeads } from '../../../leads';
import { verifySanteProPlusTransformedData } from '../../helpers/transformerVerifiers-sante-pro-plus';

/**
 * Tests du transformer Alptis Santé Pro Plus
 * Vérifie la transformation complète des leads (mapping, dates, sections conditionnelles)
 *
 * Différences avec Santé Select:
 * - Adhérent: micro_entrepreneur (toujours 'Non'), ville (auto), statut_professionnel (conditionnel)
 * - Conjoint: PAS de cadre_exercice
 */
test('Transform all leads with detailed verification (Santé Pro Plus)', () => {
  const leads = loadAllLeads();

  console.log(`\n${'='.repeat(80)}`);
  console.log(`TESTING SANTE PRO PLUS TRANSFORMER WITH ${leads.length} LEADS`);
  console.log('='.repeat(80));

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ index: number; leadId: string; error: string }> = [];

  leads.forEach((lead, index) => {
    const emailNumber = String(index + 1).padStart(3, '0');

    console.log(`\n${'='.repeat(80)}`);
    console.log(`TEST LEAD #${index + 1}/${leads.length} - email-${emailNumber}`);
    console.log('='.repeat(80));

    try {
      // Transform using Santé Pro Plus transformer
      const transformed = LeadTransformer.transform(lead);

      // Verify with Santé Pro Plus specific verifier
      verifySanteProPlusTransformedData(transformed, lead, index);

      successCount++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Lead #${index + 1} failed:`, errorMessage);
      errors.push({
        index: index + 1,
        leadId: lead.id || `email-${emailNumber}`,
        error: errorMessage,
      });
      errorCount++;
    }
  });

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('TRANSFORMATION SUMMARY (SANTE PRO PLUS)');
  console.log('='.repeat(80));
  console.log(`Success: ${successCount}/${leads.length}`);
  console.log(`Errors: ${errorCount}/${leads.length}`);

  if (errors.length > 0) {
    console.log('\nERRORS:');
    errors.forEach(({ index, leadId, error }) => {
      console.log(`  - Lead #${index} (${leadId}): ${error}`);
    });
  }

  // Assert all leads transformed successfully
  expect(errorCount).toBe(0);
  expect(successCount).toBe(leads.length);

  console.log(`\nAll ${leads.length} leads transformed successfully (Sante Pro Plus)`);
});

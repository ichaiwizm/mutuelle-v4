/**
 * Bulk validation test suite for SwissLife One
 *
 * Tests all available leads through the complete form workflow.
 * Each lead is validated independently with full form filling and verification (7 sections).
 *
 * IMPORTANT: This test is VERY slow due to iframe loading (~45s per lead)
 * With 22 leads * ~3 minutes each = ~66 minutes total runtime
 *
 * @group integration
 * @group slow
 */

import { test, expect } from '@playwright/test';
import { BulkTestRunner } from '../helpers/BulkTestRunner';
import { BulkTestLogger, loadAllLeads } from '../../leads';
import { hasSwissLifeOneCredentials } from '../helpers/credentials';
import type { BulkTestResults } from '../types';

test.skip(!hasSwissLifeOneCredentials(), 'Credentials manquants dans .env');

test('Bulk validation - authenticate and validate all leads', async ({ page }) => {
  // Set longer timeout for bulk validation
  // SwissLife One is SLOW: ~3 minutes per lead due to iframe
  // 22 leads * 180s each = 3960s = ~66 minutes
  test.setTimeout(4000000); // 67 minutes (with buffer)

  const leadCount = loadAllLeads().length;
  console.log(`\nPreparing to validate ${leadCount} leads`);
  console.log(`⚠️  WARNING: This will take approximately ${Math.round((leadCount * 3) / 60)} hours!`);
  console.log(`Each lead takes ~3 minutes due to iframe loading...\n`);

  const logger = new BulkTestLogger();
  const runner = new BulkTestRunner(logger);

  let results: BulkTestResults;

  await test.step('Authenticate with SwissLife One', async () => {
    await runner.initialize(page);
  });

  await test.step('Run bulk validation', async () => {
    results = await runner.runAll(page);
  });

  await test.step('Display summary', async () => {
    logger.printSummary();
  });

  await test.step('Assert no failures', async () => {
    expect(
      results!.failed,
      `${results!.failed} lead(s) failed validation. See logs above for details.`
    ).toBe(0);
  });
});

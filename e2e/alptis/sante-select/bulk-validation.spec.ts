/**
 * Bulk validation test suite
 *
 * Tests all available leads through the complete form workflow.
 * Each lead is validated independently with full form filling and verification.
 *
 * @group integration
 * @group slow
 */

import { test, expect } from '@playwright/test';
import { BulkTestRunner } from '../helpers/BulkTestRunner';
import { BulkTestLogger, loadAllLeads } from '../../leads';
import { hasAlptisCredentials } from '../helpers/credentials';
import type { BulkTestResults } from '../types';

test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

test('Bulk validation - authenticate and validate all leads', async ({ page }) => {
  // Set longer timeout for bulk validation (22 leads * ~15s each = ~5.5 minutes)
  test.setTimeout(600000); // 10 minutes
  const leadCount = loadAllLeads().length;
  console.log(`\nPreparing to validate ${leadCount} leads\n`);

  const logger = new BulkTestLogger();
  const runner = new BulkTestRunner(logger);

  let results: BulkTestResults;

  await test.step('Authenticate with Alptis', async () => {
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

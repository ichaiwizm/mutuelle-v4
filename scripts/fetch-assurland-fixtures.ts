/**
 * Script to fetch Assurland email fixtures from Gmail
 * Run with: npx tsx scripts/fetch-assurland-fixtures.ts
 */

import 'dotenv/config';
import { FixtureExporter } from '../src/main/services/fixtureExporter';

async function main() {
  console.log('🔍 Fetching Assurland fixtures from Gmail...');
  console.log('   Looking for emails from @assurland.com in the last 365 days\n');

  try {
    const result = await FixtureExporter.exportEmailsToFixtures(365);

    console.log('✅ Export complete:');
    console.log(`   - Added: ${result.added} new fixtures`);
    console.log(`   - Skipped: ${result.skipped} (already exists or not from lead providers)`);

    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      result.errors.forEach(err => console.log(`   - ${err}`));
    }

    if (result.added > 0) {
      console.log('\n📁 Fixtures saved to: src/main/__tests__/fixtures/emails/');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

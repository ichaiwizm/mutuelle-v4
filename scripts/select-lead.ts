#!/usr/bin/env tsx

/**
 * Interactive CLI tool for selecting a lead and launching Playwright UI tests
 *
 * Usage:
 *   pnpm lead-test
 *
 * This script will:
 * 1. Display all available leads with their metadata
 * 2. Let you select one interactively with arrow keys
 * 3. Automatically launch Playwright UI with the selected lead
 */

import prompts from 'prompts';
import { spawn } from 'child_process';
import { loadAllLeads } from '../e2e/alptis/helpers/loadLeads';
import { categorizeLeads, type CategorizedLead } from '../e2e/alptis/helpers/leadCategorization';

/**
 * Get emoji representing family composition
 */
function getFamilyEmoji(categorized: CategorizedLead): string {
  const { hasConjoint, childrenCount } = categorized.metadata;

  if (hasConjoint && childrenCount > 0) {
    return '👨‍👩‍👧';
  } else if (hasConjoint && childrenCount === 0) {
    return '👫';
  } else if (!hasConjoint && childrenCount > 0) {
    return '👶';
  } else {
    return '🧍';
  }
}

/**
 * Get family composition description
 */
function getFamilyDescription(categorized: CategorizedLead): string {
  const { hasConjoint, childrenCount } = categorized.metadata;

  if (hasConjoint && childrenCount > 0) {
    return `conjoint + ${childrenCount} enfant${childrenCount > 1 ? 's' : ''}`;
  } else if (hasConjoint) {
    return 'conjoint uniquement';
  } else if (childrenCount > 0) {
    return `${childrenCount} enfant${childrenCount > 1 ? 's' : ''} uniquement`;
  } else {
    return 'solo';
  }
}

/**
 * Format a lead for display in the selection list
 */
function formatLeadChoice(categorized: CategorizedLead): string {
  const emoji = getFamilyEmoji(categorized);
  const name = categorized.metadata.subscriberName;
  const family = getFamilyDescription(categorized);
  const profession = categorized.metadata.profession || 'N/A';

  return `[${categorized.index}] ${emoji} ${name} (${family}) - ${profession}`;
}

/**
 * Main CLI function
 */
async function main() {
  console.log('\n📋 Interactive Lead Selector for Playwright Tests\n');
  console.log('Loading leads...\n');

  // Load and categorize all leads
  const allLeads = loadAllLeads();
  const categorized = categorizeLeads(allLeads);

  console.log(`Found ${categorized.length} leads\n`);

  // Create choices for prompts
  const choices = categorized.map((cat) => ({
    title: formatLeadChoice(cat),
    value: cat.index,
    description: `Régime: ${cat.metadata.regimeType}`,
  }));

  // Prompt user to select a lead
  const response = await prompts({
    type: 'select',
    name: 'leadIndex',
    message: 'Select a lead to test:',
    choices,
    initial: 0,
  });

  // Handle cancellation (Ctrl+C)
  if (response.leadIndex === undefined) {
    console.log('\n❌ Selection cancelled\n');
    process.exit(0);
  }

  const selectedIndex = response.leadIndex;
  const selectedLead = categorized.find((c) => c.index === selectedIndex);

  if (!selectedLead) {
    console.error('\n❌ Error: Lead not found\n');
    process.exit(1);
  }

  console.log('\n✅ Selected lead:');
  console.log(`   ${formatLeadChoice(selectedLead)}\n`);

  // Launch Playwright UI with the selected lead index
  console.log('🚀 Launching Playwright UI with selected lead...\n');
  console.log('   Running: single-lead-journey.spec.ts\n');

  const playwrightProcess = spawn(
    'npx',
    ['playwright', 'test', 'e2e/alptis/sante-select/single-lead-journey.spec.ts', '--ui'],
    {
      env: {
        ...process.env,
        LEAD_INDEX: String(selectedIndex),
      },
      stdio: 'inherit',
      shell: true,
    }
  );

  playwrightProcess.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Playwright UI closed successfully\n');
    } else {
      console.log(`\n⚠️  Playwright UI exited with code ${code}\n`);
    }
    process.exit(code ?? 0);
  });

  playwrightProcess.on('error', (error) => {
    console.error('\n❌ Failed to launch Playwright UI:', error.message, '\n');
    process.exit(1);
  });
}

// Run the CLI
main().catch((error) => {
  console.error('\n❌ Unexpected error:', error.message, '\n');
  process.exit(1);
});

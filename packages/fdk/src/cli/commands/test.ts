/**
 * Test command - runs a flow with test data
 * Usage: fdk test <flowKey> [--lead-id=X] [--headed]
 */
import { error, success, warn, info, bold, progress, dim } from '../utils/console';
import { entoriaPackFamilleFlow } from '../../main/flows/entoria-pack-famille';
import { swisslifeOneSLSISFlow } from '../../main/flows/swisslife-one-slsis';
import { alptisSanteProPlusFlow } from '../../main/flows/alptis-sante-pro-plus';
import { alptisSanteSelectFlow } from '../../main/flows/alptis-sante-select';

interface TestOptions { leadId?: string; headed?: boolean; }
interface FlowEntry { id: string; name: string; version: string; steps: readonly unknown[]; }

const flowMap: Record<string, FlowEntry> = {
  'entoria-pack-famille': entoriaPackFamilleFlow as unknown as FlowEntry,
  'swisslife-one-slsis': swisslifeOneSLSISFlow as unknown as FlowEntry,
  'alptis-sante-pro-plus': alptisSanteProPlusFlow as unknown as FlowEntry,
  'alptis-sante-select': alptisSanteSelectFlow as unknown as FlowEntry,
};

function generateTestLead(flowKey: string): Record<string, unknown> {
  return {
    id: 'test-lead-001', nom: 'Dupont', prenom: 'Jean', dateNaissance: '1985-03-15',
    codePostal: '75001', email: 'test@example.com', telephone: '0612345678',
    profession: 'artisan', regime: 'tns', situationFamiliale: 'marie',
    _flowKey: flowKey, _testMode: true,
  };
}

export async function testCommand(flowKey: string, options: TestOptions): Promise<void> {
  console.log(`\n${bold('Testing Flow')}: ${flowKey}\n`);

  const flow = flowMap[flowKey];
  if (!flow) {
    error(`Flow not found: ${flowKey}`);
    info(`Available flows: ${Object.keys(flowMap).join(', ')}`);
    process.exit(1);
  }

  info(`Flow: ${flow.name} v${flow.version}`);
  info(`Mode: ${options.headed ? 'headed (visible browser)' : 'headless'}`);
  dim(`Lead ID: ${options.leadId || 'test-lead-001 (generated)'}\n`);

  const testLead = generateTestLead(flowKey);
  if (options.leadId) testLead.id = options.leadId;

  const steps = Array.isArray(flow.steps) ? flow.steps : [];
  progress(1, steps.length + 2, 'Initializing test environment...');

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i] as { id?: string; name?: string };
    progress(i + 2, steps.length + 2, `Executing: ${step.name || step.id || `step-${i}`}`);
    await new Promise((r) => setTimeout(r, 100));
  }

  progress(steps.length + 2, steps.length + 2, 'Collecting results...');
  console.log('');
  success('Test execution completed!');
  console.log(`\n${bold('Results')}:`);
  dim(`  Flow: ${flowKey} | Steps: ${steps.length} | Status: SIMULATED`);
  warn('Runtime not connected - results are simulated');
}

/**
 * List command - displays all available flows
 * Usage: fdk list
 */
import { info, dim, bold } from '../utils/console';
import { entoriaPackFamilleFlow } from '../../main/flows/entoria-pack-famille';
import { swisslifeOneSLSISFlow } from '../../main/flows/swisslife-one-slsis';
import { alptisSanteProPlusFlow } from '../../main/flows/alptis-sante-pro-plus';
import { alptisSanteSelectFlow } from '../../main/flows/alptis-sante-select';

export interface FlowInfo {
  id: string;
  name: string;
  version: string;
  stepCount: number;
}

function getFlows(): FlowInfo[] {
  return [
    { id: entoriaPackFamilleFlow.id, name: entoriaPackFamilleFlow.name, version: entoriaPackFamilleFlow.version, stepCount: entoriaPackFamilleFlow.steps?.length ?? Object.keys(entoriaPackFamilleFlow.steps || {}).length },
    { id: swisslifeOneSLSISFlow.id, name: swisslifeOneSLSISFlow.name, version: swisslifeOneSLSISFlow.version, stepCount: swisslifeOneSLSISFlow.steps.length },
    { id: alptisSanteProPlusFlow.id, name: alptisSanteProPlusFlow.name, version: alptisSanteProPlusFlow.version, stepCount: alptisSanteProPlusFlow.steps.length },
    { id: alptisSanteSelectFlow.id, name: alptisSanteSelectFlow.name, version: alptisSanteSelectFlow.version, stepCount: alptisSanteSelectFlow.steps.length },
  ];
}

export function listCommand(): void {
  const flows = getFlows();
  console.log(`\n${bold('Available Flows')}\n`);
  info(`Found ${flows.length} flows:\n`);

  for (const flow of flows) {
    console.log(`  ${bold(flow.id)}`);
    dim(`    Name: ${flow.name}`);
    dim(`    Version: ${flow.version}`);
    dim(`    Steps: ${flow.stepCount}`);
    console.log('');
  }
}

export function getFlowById(flowKey: string): FlowInfo | undefined {
  return getFlows().find((f) => f.id === flowKey);
}

export function getAllFlowIds(): string[] {
  return getFlows().map((f) => f.id);
}

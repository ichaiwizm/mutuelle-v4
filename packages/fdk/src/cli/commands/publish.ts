/**
 * Publish command - exports flow to YAML and saves to database
 * Usage: fdk publish <flowKey> [--version=X.Y.Z]
 */
import { error, success, info, bold, progress } from '../utils/console';
import { exportFlow, type ValidationError } from '../../main/export';
import { publish, getAll, type FlowRecord } from '../../main/db/flow-repository';
import { entoriaPackFamilleFlow } from '../../main/flows/entoria-pack-famille';
import { swisslifeOneSLSISFlow } from '../../main/flows/swisslife-one-slsis';
import { alptisSanteProPlusFlow } from '../../main/flows/alptis-sante-pro-plus';
import { alptisSanteSelectFlow } from '../../main/flows/alptis-sante-select';
import type { Flow } from '../../core/define-flow';
import type { FlowDefinition } from '@mutuelle/engine';

type FlowLike = { toDefinition?: () => FlowDefinition; name?: string; version?: string; steps?: readonly unknown[] | unknown[] };
type FlowEntry = Flow | FlowLike;
const isFlow = (f: FlowEntry): f is Flow => typeof (f as Flow).toDefinition === 'function';

const flowMap: Record<string, FlowEntry> = {
  'entoria-pack-famille': entoriaPackFamilleFlow as unknown as FlowEntry,
  'swisslife-one-slsis': swisslifeOneSLSISFlow as FlowEntry,
  'alptis-sante-pro-plus': alptisSanteProPlusFlow as FlowEntry,
  'alptis-sante-select': alptisSanteSelectFlow as FlowEntry,
};

export function publishCommand(flowKey: string, version?: string): void {
  console.log(`\n${bold('Publishing Flow')}: ${flowKey}\n`);

  const flow = flowMap[flowKey];
  if (!flow) {
    error(`Flow not found: ${flowKey}`);
    info(`Available flows: ${Object.keys(flowMap).join(', ')}`);
    process.exit(1);
  }

  progress(1, 4, 'Converting flow to definition...');
  const flowDef = isFlow(flow) ? flow.toDefinition() : {
    metadata: { name: flow.name || flowKey, version: flow.version || '1.0.0' },
    steps: Array.isArray(flow.steps) ? [...flow.steps] : [],
  } as FlowDefinition;

  progress(2, 4, 'Validating and exporting...');
  const result = exportFlow(flowDef);

  if (!result.success || !result.yaml) {
    error('Export failed with validation errors:');
    result.errors.forEach((e: ValidationError) => console.log(`  - ${e.path}: ${e.message}`));
    process.exit(1);
  }

  if (result.warnings.length > 0) {
    info(`${result.warnings.length} warning(s):`);
    result.warnings.forEach((w: ValidationError) => console.log(`  - ${w.path}: ${w.message}`));
  }

  progress(3, 4, 'Publishing to database...');
  const finalVersion = version || flowDef.metadata.version;
  const record = publish(flowKey, result.yaml, finalVersion);

  progress(4, 4, 'Done!');
  success(`Published ${flowKey} v${finalVersion} to database`);
  info(`Checksum: ${record.checksum.substring(0, 16)}...`);
}

export function publishedListCommand(): void {
  console.log(`\n${bold('Published Flows')}\n`);
  const flows = getAll();

  if (flows.length === 0) {
    info('No published flows found.');
    return;
  }

  flows.forEach((f: FlowRecord) => {
    console.log(`  ${bold(f.flowKey)} v${f.version} [${f.status}]`);
    console.log(`    Checksum: ${f.checksum.substring(0, 16)}...`);
  });
}

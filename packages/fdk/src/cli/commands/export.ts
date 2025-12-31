/**
 * Export command - exports flow to YAML
 * Usage: fdk export <flowKey> [--output=path]
 */
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { error, success, warn, info, bold, progress } from '../utils/console';
import { exportFlow, type ValidationError } from '../../main/export';
import { entoriaPackFamilleFlow } from '../../main/flows/entoria-pack-famille';
import { swisslifeOneSLSISFlow } from '../../main/flows/swisslife-one-slsis';
import { alptisSanteProPlusFlow } from '../../main/flows/alptis-sante-pro-plus';
import { alptisSanteSelectFlow } from '../../main/flows/alptis-sante-select';
import type { FlowDefinition } from '@mutuelle/engine';

type FlowLike = { toDefinition?: () => FlowDefinition; name?: string; version?: string; steps?: readonly unknown[] | unknown[] };
const flowMap: Record<string, FlowLike> = {
  'entoria-pack-famille': entoriaPackFamilleFlow as FlowLike,
  'swisslife-one-slsis': swisslifeOneSLSISFlow as FlowLike,
  'alptis-sante-pro-plus': alptisSanteProPlusFlow as FlowLike,
  'alptis-sante-select': alptisSanteSelectFlow as FlowLike,
};

export function exportCommand(flowKey: string, outputPath?: string): void {
  console.log(`\n${bold('Exporting Flow')}: ${flowKey}\n`);

  const flow = flowMap[flowKey];
  if (!flow) {
    error(`Flow not found: ${flowKey}`);
    info(`Available flows: ${Object.keys(flowMap).join(', ')}`);
    process.exit(1);
  }

  progress(1, 3, 'Converting flow to definition...');
  const flowDef = flow.toDefinition ? flow.toDefinition() : {
    metadata: { name: flow.name || flowKey, version: flow.version || '1.0.0' },
    steps: Array.isArray(flow.steps) ? flow.steps : Object.values(flow.steps || {}),
  };

  progress(2, 3, 'Validating and exporting...');
  const result = exportFlow(flowDef as FlowDefinition);

  if (!result.success) {
    error('Export failed with validation errors:');
    result.errors.forEach((e: ValidationError) => console.log(`  - ${e.path}: ${e.message}`));
    process.exit(1);
  }

  if (result.warnings.length > 0) {
    warn(`${result.warnings.length} warning(s):`);
    result.warnings.forEach((w: ValidationError) => console.log(`  - ${w.path}: ${w.message}`));
  }

  progress(3, 3, 'Writing output file...');
  const outFile = outputPath || resolve(process.cwd(), `${flowKey}.flow.yaml`);
  writeFileSync(outFile, result.yaml!, 'utf-8');

  success(`Exported to: ${outFile}`);
  info(`Checksum: ${result.metadata?.checksum.substring(0, 16)}...`);
}

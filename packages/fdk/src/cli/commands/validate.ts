/**
 * Validate command - validates flow definition
 * Usage: fdk validate <flowKey>
 */
import { error, success, warn, info, bold } from '../utils/console';
import { validate, type ValidationError } from '../../main/export';
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

export function validateCommand(flowKey: string): void {
  console.log(`\n${bold('Validating Flow')}: ${flowKey}\n`);

  const flow = flowMap[flowKey];
  if (!flow) {
    error(`Flow not found: ${flowKey}`);
    info(`Available flows: ${Object.keys(flowMap).join(', ')}`);
    process.exit(1);
  }

  const flowDef = flow.toDefinition ? flow.toDefinition() : {
    metadata: { name: (flow as { name?: string }).name || flowKey, version: (flow as { version?: string }).version || '1.0.0' },
    steps: Array.isArray(flow.steps) ? flow.steps : Object.values(flow.steps || {}),
  };

  const errors = validate(flowDef as FlowDefinition);
  const errorsOnly = errors.filter((e: ValidationError) => e.severity === 'error');
  const warnings = errors.filter((e: ValidationError) => e.severity === 'warning');

  if (errorsOnly.length > 0) {
    error(`Found ${errorsOnly.length} error(s):`);
    errorsOnly.forEach((e: ValidationError) => console.log(`  - ${e.path}: ${e.message}`));
  }

  if (warnings.length > 0) {
    warn(`Found ${warnings.length} warning(s):`);
    warnings.forEach((w: ValidationError) => console.log(`  - ${w.path}: ${w.message}`));
  }

  if (errorsOnly.length === 0) {
    success(`Flow "${flowKey}" is valid!`);
    process.exit(0);
  } else {
    process.exit(1);
  }
}

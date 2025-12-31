/**
 * Publish IPC Handlers
 * Handles flow publishing to database operations
 */
import type { IpcMainInvokeEvent } from 'electron';
import { exportFlow } from '../../export';
import { publish, getAll, type FlowRecord } from '../../db/flow-repository';
import { entoriaPackFamilleFlow } from '../../flows/entoria-pack-famille';
import { swisslifeOneSLSISFlow } from '../../flows/swisslife-one-slsis';
import { alptisSanteProPlusFlow } from '../../flows/alptis-sante-pro-plus';
import { alptisSanteSelectFlow } from '../../flows/alptis-sante-select';
import type { FlowDefinition } from '@mutuelle/engine';

import type { Flow } from '../../../core/define-flow';

type FlowLike = { toDefinition?: () => FlowDefinition; name?: string; version?: string; steps?: readonly unknown[] | unknown[] };
type FlowEntry = Flow | FlowLike;

const flowRegistry = new Map<string, FlowEntry>([
  ['entoria-pack-famille', entoriaPackFamilleFlow as unknown as FlowEntry],
  ['swisslife-one-slsis', swisslifeOneSLSISFlow as FlowEntry],
  ['alptis-sante-pro-plus', alptisSanteProPlusFlow as FlowEntry],
  ['alptis-sante-select', alptisSanteSelectFlow as FlowEntry],
]);

export interface PublishResult {
  success: boolean;
  flowKey?: string;
  version?: string;
  checksum?: string;
  error?: string;
}

export interface PublishedFlowInfo {
  flowKey: string;
  version: string;
  checksum: string;
  status: string;
  updatedAt: Date;
}

const isFlow = (f: FlowEntry): f is Flow => typeof (f as Flow).toDefinition === 'function';
const toFlowDef = (f: FlowEntry): FlowDefinition => isFlow(f) ? f.toDefinition() : {
  metadata: { name: f.name || 'unknown', version: f.version || '1.0.0' },
  steps: Array.isArray(f.steps) ? [...f.steps] : [],
} as FlowDefinition;

/** Publish a flow to the database */
export async function handleFlowPublish(
  _e: IpcMainInvokeEvent,
  flowKey: string,
  version?: string
): Promise<PublishResult> {
  const flow = flowRegistry.get(flowKey);
  if (!flow) return { success: false, error: `Flow not found: ${flowKey}` };

  const flowDef = toFlowDef(flow);
  const exportResult = exportFlow(flowDef);
  if (!exportResult.success || !exportResult.yaml) {
    return { success: false, error: exportResult.errors[0]?.message || 'Export failed' };
  }

  const finalVersion = version || flowDef.metadata.version;
  const record = publish(flowKey, exportResult.yaml, finalVersion);

  return { success: true, flowKey, version: finalVersion, checksum: record.checksum };
}

/** List all published flows */
export async function handlePublishedFlowList(_e: IpcMainInvokeEvent): Promise<PublishedFlowInfo[]> {
  const flows = getAll();
  return flows.map((f: FlowRecord) => ({
    flowKey: f.flowKey, version: f.version, checksum: f.checksum, status: f.status, updatedAt: f.updatedAt,
  }));
}

/**
 * Flow mapping utilities
 */
import { type FlowInfo } from './types';

interface RawFlow {
  id: string;
  name: string;
  description?: string;
  version: string;
  platform?: string;
  product?: string;
  status?: string;
  source: 'file' | 'database';
  filePath?: string;
}

export function mapFlowInfo(f: RawFlow): FlowInfo {
  return {
    id: f.id,
    name: f.name,
    description: f.description || '',
    version: f.version,
    platform: f.platform || 'unknown',
    product: f.product || 'unknown',
    status: f.status || 'active',
    source: f.source,
    filePath: f.filePath,
  };
}

export function mapFlowsArray(flows: RawFlow[]): FlowInfo[] {
  return flows.map(mapFlowInfo);
}

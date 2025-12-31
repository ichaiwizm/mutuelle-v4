/**
 * Flow types
 */

export type FlowSource = 'file' | 'database' | 'all';

export interface FlowInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  platform: string;
  product: string;
  status: string;
  source: 'file' | 'database';
  filePath?: string;
}

export interface UseFlowsState {
  flows: FlowInfo[];
  selectedFlow: FlowInfo | null;
  loading: boolean;
  error: string | null;
  sourceFilter: FlowSource;
}

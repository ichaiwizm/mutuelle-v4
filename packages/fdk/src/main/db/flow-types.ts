/**
 * FDK Flow Loader Types
 */
import type { FlowDefinition } from "@mutuelle/engine";

export interface FlowRecord {
  id: string;
  flowKey: string;
  platform: string;
  product: string;
  version: string;
  yamlContent: string;
  checksum: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlowInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  platform: string;
  product: string;
  status: string;
}

export interface CachedFlow {
  flow: FlowDefinition;
  checksum: string;
  loadedAt: Date;
}

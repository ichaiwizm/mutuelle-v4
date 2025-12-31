/**
 * Shared types for flow loaders
 */
import type { FlowDefinition } from "@mutuelle/engine";

export interface FileFlowInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  platform: string;
  product: string;
  source: "file";
  filePath: string;
}

export interface CachedFileFlow {
  flow: FlowDefinition;
  mtime: number;
  filePath: string;
}

export interface DbFlowRecord {
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

export interface DbFlowInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  platform: string;
  product: string;
  status: string;
  source: "database";
}

export interface CachedDbFlow {
  flow: FlowDefinition;
  checksum: string;
  loadedAt: Date;
}

export type FlowSource = "file" | "database" | "all";

export interface UnifiedFlowInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  platform: string;
  product: string;
  source: "file" | "database";
  status?: string;
  filePath?: string;
}

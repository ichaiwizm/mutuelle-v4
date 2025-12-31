/**
 * Flow Source Normalizers
 * Functions to normalize flow info from different sources
 */
import type { FileFlowInfo } from "./types";
import type { DbFlowInfo, UnifiedFlowInfo } from "./types";

/**
 * Normalize file flow info to unified format
 */
export function normalizeFileFlow(flow: FileFlowInfo): UnifiedFlowInfo {
  return {
    id: flow.id,
    name: flow.name,
    description: flow.description,
    version: flow.version,
    platform: flow.platform,
    product: flow.product,
    source: "file",
    filePath: flow.filePath,
  };
}

/**
 * Normalize database flow info to unified format
 */
export function normalizeDbFlow(flow: DbFlowInfo): UnifiedFlowInfo {
  return {
    id: flow.id,
    name: flow.name,
    description: flow.description,
    version: flow.version,
    platform: flow.platform,
    product: flow.product,
    source: "database",
    status: flow.status,
  };
}

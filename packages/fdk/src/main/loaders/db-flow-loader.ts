/**
 * Database Flow Loader
 * Loads and caches flow definitions from the shared database
 */
import type { FlowDefinition } from "@mutuelle/engine";
import type { DbFlowRecord, DbFlowInfo, CachedDbFlow } from "./types";
import {
  isTableMissingError,
  getAllDbFlows,
  getActiveDbFlows,
  getDbFlowByKey,
  parseDbFlow,
  mapToFlowInfo,
} from "./db-flow-helpers";

export type { DbFlowRecord, DbFlowInfo };

/**
 * Loads flows from the shared SQLite database
 */
export class DbFlowLoader {
  private readonly cache = new Map<string, CachedDbFlow>();

  getAll(): DbFlowRecord[] {
    try {
      return getAllDbFlows();
    } catch (error) {
      if (isTableMissingError(error)) {
        console.log("[DbFlowLoader] flow_definitions table not found");
        return [];
      }
      throw error;
    }
  }

  getActiveFlows(): DbFlowRecord[] {
    try {
      return getActiveDbFlows();
    } catch (error) {
      if (isTableMissingError(error)) return [];
      throw error;
    }
  }

  getByFlowKey(flowKey: string): DbFlowRecord | null {
    try {
      return getDbFlowByKey(flowKey);
    } catch (error) {
      if (isTableMissingError(error)) return null;
      throw error;
    }
  }

  listFlows(): DbFlowInfo[] {
    return this.getAll().map(mapToFlowInfo);
  }

  hasFlow(flowKey: string): boolean {
    return this.getByFlowKey(flowKey) !== null;
  }

  loadFlow(flowKey: string): FlowDefinition {
    const cached = this.cache.get(flowKey);
    const dbFlow = this.getByFlowKey(flowKey);
    if (!dbFlow) throw new Error(`Flow not found in database: ${flowKey}`);

    if (cached && cached.checksum === dbFlow.checksum) {
      console.log(`[DbFlowLoader] Returning cached flow: ${flowKey}`);
      return cached.flow;
    }

    console.log(`[DbFlowLoader] Parsing flow from database: ${flowKey}`);
    const result = parseDbFlow(dbFlow);
    this.cache.set(flowKey, {
      flow: result.flow,
      checksum: dbFlow.checksum,
      loadedAt: new Date(),
    });
    return result.flow;
  }

  getFlowSteps(flowKey: string) {
    const flow = this.loadFlow(flowKey);
    return flow.steps.map((s) => ({
      id: s.id, name: s.name, type: s.type, description: s.description,
    }));
  }

  getYamlContent(flowKey: string): string {
    const dbFlow = this.getByFlowKey(flowKey);
    if (!dbFlow) throw new Error(`Flow not found: ${flowKey}`);
    return dbFlow.yamlContent;
  }

  clearCache(): void {
    this.cache.clear();
    console.log("[DbFlowLoader] Cache cleared");
  }

  invalidate(flowKey: string): void {
    this.cache.delete(flowKey);
    console.log(`[DbFlowLoader] Cache invalidated for: ${flowKey}`);
  }
}

/**
 * FDK Flow Loader
 * Loads and caches flow definitions from the shared database
 */
import type { FlowDefinition } from "@mutuelle/engine";
import type { FlowRecord, FlowInfo, CachedFlow } from "./flow-types";
import {
  isTableMissing,
  getAllFlows,
  getActiveFlows,
  getFlowByKey,
  parseFlowContent,
  mapRecordToInfo,
} from "./flow-helpers";

export type { FlowRecord, FlowInfo, CachedFlow };

/**
 * FDK Flow Loader - Loads flows from shared database
 */
export class FdkFlowLoader {
  private readonly cache = new Map<string, CachedFlow>();

  getAll(): FlowRecord[] {
    try {
      return getAllFlows();
    } catch (error) {
      if (isTableMissing(error)) {
        console.log("[FdkFlowLoader] flow_definitions table not found");
        return [];
      }
      throw error;
    }
  }

  getActiveFlows(): FlowRecord[] {
    try {
      return getActiveFlows();
    } catch (error) {
      if (isTableMissing(error)) return [];
      throw error;
    }
  }

  getByFlowKey(flowKey: string): FlowRecord | null {
    return getFlowByKey(flowKey);
  }

  listFlows(): FlowInfo[] {
    return this.getAll().map(mapRecordToInfo);
  }

  loadFlow(flowKey: string): FlowDefinition {
    const cached = this.cache.get(flowKey);
    const dbFlow = this.getByFlowKey(flowKey);
    if (!dbFlow) throw new Error(`Flow not found in database: ${flowKey}`);

    if (cached && cached.checksum === dbFlow.checksum) {
      console.log(`[FdkFlowLoader] Returning cached flow: ${flowKey}`);
      return cached.flow;
    }

    console.log(`[FdkFlowLoader] Parsing flow from database: ${flowKey}`);
    const result = parseFlowContent(dbFlow);
    this.cache.set(flowKey, { flow: result.flow, checksum: dbFlow.checksum, loadedAt: new Date() });
    return result.flow;
  }

  getFlowSteps(flowKey: string) {
    const flow = this.loadFlow(flowKey);
    return flow.steps.map((s) => ({ id: s.id, name: s.name, type: s.type, description: s.description }));
  }

  getYamlContent(flowKey: string): string {
    const dbFlow = this.getByFlowKey(flowKey);
    if (!dbFlow) throw new Error(`Flow not found: ${flowKey}`);
    return dbFlow.yamlContent;
  }

  clearCache(): void {
    this.cache.clear();
    console.log("[FdkFlowLoader] Cache cleared");
  }

  invalidate(flowKey: string): void {
    this.cache.delete(flowKey);
    console.log(`[FdkFlowLoader] Cache invalidated for: ${flowKey}`);
  }
}

export const fdkFlowLoader = new FdkFlowLoader();

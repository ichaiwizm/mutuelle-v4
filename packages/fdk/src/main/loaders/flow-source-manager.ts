/**
 * Flow Source Manager
 * Orchestrates loading flows from multiple sources (files and database)
 * Files are prioritary: if a flow exists in both, file version is used
 */
import type { FlowDefinition } from "@mutuelle/engine";
import { FileFlowLoader } from "./file-flow-loader";
import { DbFlowLoader } from "./db-flow-loader";
import type { FlowSource, UnifiedFlowInfo } from "./types";
import { normalizeFileFlow, normalizeDbFlow } from "./flow-source-normalizers";

export type { FlowSource, UnifiedFlowInfo };

/**
 * Manages multiple flow sources with file-first priority
 */
export class FlowSourceManager {
  private readonly fileLoader: FileFlowLoader;
  private readonly dbLoader: DbFlowLoader;

  constructor(flowsDir: string) {
    this.fileLoader = new FileFlowLoader(flowsDir);
    this.dbLoader = new DbFlowLoader();
  }

  listFlows(source: FlowSource = "all"): UnifiedFlowInfo[] {
    if (source === "file") return this.fileLoader.listFlows().map(normalizeFileFlow);
    if (source === "database") return this.dbLoader.listFlows().map(normalizeDbFlow);

    const fileFlows = this.fileLoader.listFlows();
    const dbFlows = this.dbLoader.listFlows();
    const fileKeys = new Set(fileFlows.map((f) => f.id));
    const uniqueDbFlows = dbFlows.filter((f) => !fileKeys.has(f.id));

    console.log(`[FlowSourceManager] ${fileFlows.length} file, ${uniqueDbFlows.length} unique DB flows`);
    return [...fileFlows.map(normalizeFileFlow), ...uniqueDbFlows.map(normalizeDbFlow)];
  }

  loadFlow(flowKey: string): FlowDefinition {
    if (this.fileLoader.hasFlow(flowKey)) {
      console.log(`[FlowSourceManager] Loading from file: ${flowKey}`);
      return this.fileLoader.loadFlow(flowKey);
    }
    if (this.dbLoader.hasFlow(flowKey)) {
      console.log(`[FlowSourceManager] Loading from database: ${flowKey}`);
      return this.dbLoader.loadFlow(flowKey);
    }
    throw new Error(`Flow not found in any source: ${flowKey}`);
  }

  hasFlow(flowKey: string): boolean {
    return this.fileLoader.hasFlow(flowKey) || this.dbLoader.hasFlow(flowKey);
  }

  getFlowSource(flowKey: string): FlowSource | null {
    if (this.fileLoader.hasFlow(flowKey)) return "file";
    if (this.dbLoader.hasFlow(flowKey)) return "database";
    return null;
  }

  getYamlContent(flowKey: string): string {
    if (this.fileLoader.hasFlow(flowKey)) return this.fileLoader.getYamlContent(flowKey);
    return this.dbLoader.getYamlContent(flowKey);
  }

  getFlowSteps(flowKey: string) {
    if (this.fileLoader.hasFlow(flowKey)) return this.fileLoader.getFlowSteps(flowKey);
    return this.dbLoader.getFlowSteps(flowKey);
  }

  clearCache(): void {
    this.fileLoader.clearCache();
    this.dbLoader.clearCache();
    console.log("[FlowSourceManager] All caches cleared");
  }

  invalidate(flowKey: string): void {
    this.fileLoader.invalidate(flowKey);
    this.dbLoader.invalidate(flowKey);
  }

  getFileLoader(): FileFlowLoader { return this.fileLoader; }
  getDbLoader(): DbFlowLoader { return this.dbLoader; }
}

/**
 * File Flow Loader
 * Loads and caches flow definitions from YAML files on disk
 */
import * as fs from "fs";
import * as path from "path";
import { YamlParser, type FlowDefinition } from "@mutuelle/engine";
import type { FileFlowInfo, CachedFileFlow } from "./types";
import {
  getYamlFiles,
  getFlowKey,
  getFileMtime,
  findFlowFile,
  parseAndValidate,
  buildFlowInfo,
  extractPlatform,
  extractProduct,
} from "./file-flow-helpers";

export type { FileFlowInfo };

/**
 * Loads flows from YAML files in a specified directory
 */
export class FileFlowLoader {
  private readonly parser = new YamlParser();
  private readonly flowsDir: string;
  private readonly cache = new Map<string, CachedFileFlow>();

  constructor(flowsDir: string) {
    this.flowsDir = flowsDir;
    this.ensureDirectory();
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(this.flowsDir)) {
      fs.mkdirSync(this.flowsDir, { recursive: true });
      console.log(`[FileFlowLoader] Created flows directory: ${this.flowsDir}`);
    }
  }

  listFlows(): FileFlowInfo[] {
    const files = getYamlFiles(this.flowsDir);
    const flows: FileFlowInfo[] = [];

    for (const filename of files) {
      const flowKey = getFlowKey(filename);
      const filePath = path.join(this.flowsDir, filename);
      flows.push(this.parseFlowInfo(flowKey, filePath));
    }

    console.log(`[FileFlowLoader] Found ${flows.length} flows from files`);
    return flows;
  }

  private parseFlowInfo(flowKey: string, filePath: string): FileFlowInfo {
    try {
      const yamlContent = fs.readFileSync(filePath, "utf-8");
      const result = this.parser.parse(yamlContent);
      if (result.valid && result.flow) {
        return buildFlowInfo(flowKey, filePath, result);
      }
      return this.buildErrorInfo(flowKey, filePath, result.errors?.[0]?.message);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown";
      return this.buildErrorInfo(flowKey, filePath, `Read error: ${msg}`);
    }
  }

  private buildErrorInfo(flowKey: string, filePath: string, error?: string): FileFlowInfo {
    return {
      id: flowKey, name: flowKey, description: error || "Unknown error",
      version: "?", platform: extractPlatform(flowKey),
      product: extractProduct(flowKey), source: "file", filePath,
    };
  }

  loadFlow(flowKey: string): FlowDefinition {
    const filePath = findFlowFile(this.flowsDir, flowKey);
    if (!filePath) throw new Error(`Flow file not found: ${flowKey}`);
    const mtime = getFileMtime(filePath);
    const cached = this.cache.get(flowKey);
    if (cached && cached.mtime === mtime && cached.filePath === filePath) {
      return cached.flow;
    }
    const yamlContent = fs.readFileSync(filePath, "utf-8");
    const result = parseAndValidate(yamlContent, flowKey);
    this.cache.set(flowKey, { flow: result.flow, mtime, filePath });
    return result.flow;
  }

  hasFlow(flowKey: string): boolean {
    return findFlowFile(this.flowsDir, flowKey) !== null;
  }

  getYamlContent(flowKey: string): string {
    const filePath = findFlowFile(this.flowsDir, flowKey);
    if (!filePath) throw new Error(`Flow file not found: ${flowKey}`);
    return fs.readFileSync(filePath, "utf-8");
  }

  getFlowSteps(flowKey: string) {
    const flow = this.loadFlow(flowKey);
    return flow.steps.map((s) => ({ id: s.id, name: s.name, type: s.type, description: s.description }));
  }

  clearCache(): void { this.cache.clear(); }
  invalidate(flowKey: string): void { this.cache.delete(flowKey); }
  getFlowsDir(): string { return this.flowsDir; }
}

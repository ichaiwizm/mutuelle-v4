/**
 * File Flow Loader Helpers
 * Utility functions for file-based flow operations
 */
import * as fs from "fs";
import * as path from "path";
import { YamlParser, type ParseResult } from "@mutuelle/engine";
import type { FileFlowInfo } from "./types";

const parser = new YamlParser();

/**
 * Get all YAML files from a directory
 */
export function getYamlFiles(flowsDir: string): string[] {
  try {
    const files = fs.readdirSync(flowsDir);
    return files.filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));
  } catch (error) {
    console.error("[FileFlowLoader] Error reading flows directory:", error);
    return [];
  }
}

/**
 * Extract flow key from filename (without extension)
 */
export function getFlowKey(filename: string): string {
  return filename.replace(/\.(yaml|yml)$/, "");
}

/**
 * Get file modification time
 */
export function getFileMtime(filePath: string): number {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtimeMs;
  } catch {
    return 0;
  }
}

/**
 * Find the file path for a flow key
 */
export function findFlowFile(flowsDir: string, flowKey: string): string | null {
  const yamlPath = path.join(flowsDir, `${flowKey}.yaml`);
  const ymlPath = path.join(flowsDir, `${flowKey}.yml`);

  if (fs.existsSync(yamlPath)) return yamlPath;
  if (fs.existsSync(ymlPath)) return ymlPath;

  return null;
}

/**
 * Parse and validate YAML content
 */
export function parseAndValidate(yamlContent: string, flowKey: string): ParseResult {
  const result = parser.parse(yamlContent);

  if (!result.valid) {
    const errorMessages = result.errors
      .map((e) => `${e.path}: ${e.message}`)
      .join("; ");
    throw new Error(`Flow validation failed for ${flowKey}: ${errorMessages}`);
  }

  return result;
}

/**
 * Extract platform from flow key
 */
export function extractPlatform(flowKey: string): string {
  const parts = flowKey.split("-");
  if (parts.length > 0) {
    const platform = parts[0];
    if (platform === "swisslife") return "swisslife";
    return platform;
  }
  return "unknown";
}

/**
 * Extract product from flow key
 */
export function extractProduct(flowKey: string): string {
  const parts = flowKey.split("-");
  if (parts.length > 1) {
    return parts.slice(1).join("-");
  }
  return flowKey;
}

/**
 * Build FileFlowInfo from parsed flow
 */
export function buildFlowInfo(
  flowKey: string,
  filePath: string,
  result: ParseResult
): FileFlowInfo {
  const metadata = result.flow?.metadata;
  return {
    id: flowKey,
    name: metadata?.name || flowKey,
    description: metadata?.description || "",
    version: metadata?.version || "1.0",
    platform: extractPlatform(flowKey),
    product: extractProduct(flowKey),
    source: "file",
    filePath,
  };
}

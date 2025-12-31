/**
 * Database Flow Loader Helpers
 * Utility functions for database-based flow operations
 */
import { eq, and } from "drizzle-orm";
import { YamlParser, type ParseResult } from "@mutuelle/engine";
import { getDb } from "../db/connection";
import { flowDefinitions } from "./db-flow-schema";
import type { DbFlowRecord, DbFlowInfo } from "./types";

const parser = new YamlParser();

/**
 * Check if error is "no such table"
 */
export function isTableMissingError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("no such table");
}

/**
 * Get all flows from database
 */
export function getAllDbFlows(): DbFlowRecord[] {
  const { db } = getDb();
  const rows = db.select().from(flowDefinitions).all();
  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

/**
 * Get active flows from database
 */
export function getActiveDbFlows(): DbFlowRecord[] {
  const { db } = getDb();
  const rows = db
    .select()
    .from(flowDefinitions)
    .where(eq(flowDefinitions.status, "active"))
    .all();
  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

/**
 * Get a flow by its key (active only)
 */
export function getDbFlowByKey(flowKey: string): DbFlowRecord | null {
  const { db } = getDb();
  const row = db
    .select()
    .from(flowDefinitions)
    .where(
      and(
        eq(flowDefinitions.flowKey, flowKey),
        eq(flowDefinitions.status, "active")
      )
    )
    .get();

  if (!row) return null;
  return { ...row, createdAt: row.createdAt, updatedAt: row.updatedAt };
}

/**
 * Parse and validate a flow record
 */
export function parseDbFlow(dbFlow: DbFlowRecord): ParseResult {
  const result = parser.parse(dbFlow.yamlContent);

  if (!result.valid) {
    const errorMessages = result.errors
      .map((e) => `${e.path}: ${e.message}`)
      .join("; ");
    throw new Error(`Flow validation failed for ${dbFlow.flowKey}: ${errorMessages}`);
  }

  return result;
}

/**
 * Map DbFlowRecord to DbFlowInfo
 */
export function mapToFlowInfo(flow: DbFlowRecord): DbFlowInfo {
  try {
    const result = parser.parse(flow.yamlContent);
    return {
      id: flow.flowKey,
      name: result.flow?.metadata?.name || flow.flowKey,
      description: result.flow?.metadata?.description || "",
      version: flow.version,
      platform: flow.platform,
      product: flow.product,
      status: flow.status,
      source: "database" as const,
    };
  } catch {
    return {
      id: flow.flowKey,
      name: flow.flowKey,
      description: "Error parsing flow",
      version: flow.version,
      platform: flow.platform,
      product: flow.product,
      status: flow.status,
      source: "database" as const,
    };
  }
}

/**
 * FDK Flow Loader Helpers
 */
import { eq, and } from "drizzle-orm";
import { YamlParser, type ParseResult } from "@mutuelle/engine";
import { getDb } from "./connection";
import { flowDefinitions } from "./flow-schema";
import type { FlowRecord, FlowInfo } from "./flow-types";

const parser = new YamlParser();

export function isTableMissing(error: unknown): boolean {
  return error instanceof Error && error.message.includes("no such table");
}

export function getAllFlows(): FlowRecord[] {
  const { db } = getDb();
  const rows = db.select().from(flowDefinitions).all();
  return rows.map((r) => ({ ...r, createdAt: r.createdAt, updatedAt: r.updatedAt }));
}

export function getActiveFlows(): FlowRecord[] {
  const { db } = getDb();
  const rows = db.select().from(flowDefinitions).where(eq(flowDefinitions.status, "active")).all();
  return rows.map((r) => ({ ...r, createdAt: r.createdAt, updatedAt: r.updatedAt }));
}

export function getFlowByKey(flowKey: string): FlowRecord | null {
  const { db } = getDb();
  const row = db
    .select()
    .from(flowDefinitions)
    .where(and(eq(flowDefinitions.flowKey, flowKey), eq(flowDefinitions.status, "active")))
    .get();
  if (!row) return null;
  return { ...row, createdAt: row.createdAt, updatedAt: row.updatedAt };
}

export function parseFlowContent(dbFlow: FlowRecord): ParseResult {
  const result = parser.parse(dbFlow.yamlContent);
  if (!result.valid) {
    const msgs = result.errors.map((e) => `${e.path}: ${e.message}`).join("; ");
    throw new Error(`Flow validation failed for ${dbFlow.flowKey}: ${msgs}`);
  }
  return result;
}

export function mapRecordToInfo(flow: FlowRecord): FlowInfo {
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
    };
  }
}

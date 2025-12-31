/**
 * Lead Transformers
 *
 * This module provides lead transformation for different flows.
 * Transformers convert Lead data to the format required by each platform.
 *
 * NOTE: The actual transformer implementations are now in packages/fdk.
 * This file provides stubs for backward compatibility.
 */

import type { Lead } from "@/shared/types/lead";

// Transformer registry - maps flow keys to transformer functions
type TransformerFn = (lead: Lead) => unknown;

const transformerRegistry: Map<string, TransformerFn> = new Map();

/**
 * Check if a transformer exists for a flow
 */
export function hasTransformerForFlow(flowKey: string): boolean {
  // Check exact match first
  if (transformerRegistry.has(flowKey)) {
    return true;
  }

  // Check prefix match (for versioned flows like alptis_sante_select_v2)
  for (const key of transformerRegistry.keys()) {
    if (flowKey.startsWith(key)) {
      return true;
    }
  }

  return false;
}

/**
 * Get transformer for a flow
 */
export function getTransformerForFlow(flowKey: string): TransformerFn | undefined {
  // Exact match first
  if (transformerRegistry.has(flowKey)) {
    return transformerRegistry.get(flowKey);
  }

  // Prefix match
  for (const [key, transformer] of transformerRegistry.entries()) {
    if (flowKey.startsWith(key)) {
      return transformer;
    }
  }

  return undefined;
}

/**
 * Transform lead data for a specific flow
 */
export function transformLeadForFlow(flowKey: string, lead: Lead): unknown {
  const transformer = getTransformerForFlow(flowKey);
  if (!transformer) {
    throw new Error(`No transformer found for flow: ${flowKey}`);
  }
  return transformer(lead);
}

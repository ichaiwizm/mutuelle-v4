/**
 * Lead Transformer Registry
 *
 * Central registry that maps flow keys to their Lead transformers.
 * Each transformer converts a Lead (from database) to platform-specific form data.
 */

import { LeadTransformer as AlptisTransformer } from "../platforms/alptis/products/sante-select/transformers/LeadTransformer";
import { LeadTransformer as SanteProPlusTransformer } from "../platforms/alptis/products/sante-pro-plus/transformers/LeadTransformer";
import { SwissLifeOneLeadTransformer as SwissLifeTransformer } from "../platforms/swisslifeone/products/slsis/transformers/LeadTransformer";
import { LeadTransformer as EntoriaTransformer } from "../platforms/entoria/products/pack-famille/transformers/LeadTransformer";
import type { Lead } from "@/shared/types/lead";

type TransformerFn = (lead: Lead) => unknown;

/**
 * Registry of transformers by flow key
 */
const TRANSFORMERS: Record<string, TransformerFn> = {
  alptis_sante_select: (lead) => AlptisTransformer.transform(lead),
  alptis_sante_pro_plus: (lead) => SanteProPlusTransformer.transform(lead),
  swisslife_one_slsis: (lead) => SwissLifeTransformer.transform(lead),
  entoria_pack_famille: (lead) => EntoriaTransformer.transform(lead),
};

/**
 * Get transformer function for a flow key
 * Supports exact match and prefix match (e.g., "alptis_sante_select_v2" → "alptis_sante_select")
 */
export function getTransformerForFlow(flowKey: string): TransformerFn | undefined {
  // Exact match
  if (TRANSFORMERS[flowKey]) {
    return TRANSFORMERS[flowKey];
  }

  // Prefix match (for versioned flow keys)
  for (const key of Object.keys(TRANSFORMERS)) {
    if (flowKey.startsWith(key)) {
      return TRANSFORMERS[key];
    }
  }

  return undefined;
}

/**
 * Transform a lead for a specific flow
 * @throws Error if no transformer is found for the flow key
 */
export function transformLeadForFlow(flowKey: string, lead: Lead): unknown {
  const transformer = getTransformerForFlow(flowKey);
  if (!transformer) {
    throw new Error(`No transformer found for flow: ${flowKey}`);
  }
  return transformer(lead);
}

/**
 * Check if a transformer exists for a flow key
 */
export function hasTransformerForFlow(flowKey: string): boolean {
  return getTransformerForFlow(flowKey) !== undefined;
}

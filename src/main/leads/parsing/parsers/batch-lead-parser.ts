/**
 * Batch lead parser with LLM fallback
 */

import type { Lead } from "@/shared/types/lead";
import type { LeadInput } from "../../detection/detector";
import { parseLeadWithLLM, isLLMParsingAvailable } from "@/main/services/llm";
import { splitEmailIntoLeadBlocks } from "../extractors";
import { transformLLMDataToLead } from "../transformers";
import { parseLead } from "./single-lead-parser";

/**
 * Batch parse multiple text/email inputs
 * OR parse a single email that may contain multiple leads
 * Uses standard parsers first, then LLM as fallback
 */
export async function parseLeads(
  inputs: Array<string | LeadInput> | string | LeadInput,
  metadata?: { emailId?: string; source?: string }
): Promise<Lead[]> {
  if (!Array.isArray(inputs)) {
    return parseSingleInput(inputs, metadata);
  }
  return parseMultipleInputs(inputs, metadata);
}

async function parseSingleInput(
  inputs: string | LeadInput,
  metadata?: { emailId?: string; source?: string }
): Promise<Lead[]> {
  const text = typeof inputs === "string" ? inputs : inputs.text;
  const subject = typeof inputs === "string" ? undefined : inputs.subject;

  // Strategy 1: Try to split into multiple lead blocks
  const blocks = splitEmailIntoLeadBlocks(text);
  if (blocks.length > 0) {
    const leads = blocks
      .map((block) => parseLead(block, metadata))
      .filter((lead): lead is Lead => lead !== null);
    if (leads.length > 0) return leads;
  }

  // Strategy 2: Try to parse as a single lead
  const singleLead = parseLead({ text, subject }, metadata);
  if (singleLead) return [singleLead];

  // Strategy 3: Try LLM parsing as fallback
  if (isLLMParsingAvailable()) {
    const llmData = await parseLeadWithLLM(text);
    if (llmData) return [transformLLMDataToLead(llmData, metadata)];
  }

  return [];
}

async function parseMultipleInputs(
  inputs: Array<string | LeadInput>,
  metadata?: { emailId?: string; source?: string }
): Promise<Lead[]> {
  const leads = await Promise.all(
    inputs.map(async (input) => {
      const lead = parseLead(input, metadata);
      if (lead) return lead;

      if (isLLMParsingAvailable()) {
        const text = typeof input === "string" ? input : input.text;
        const llmData = await parseLeadWithLLM(text);
        if (llmData) return transformLLMDataToLead(llmData, metadata);
      }
      return null;
    })
  );

  return leads.filter((lead): lead is Lead => lead !== null);
}

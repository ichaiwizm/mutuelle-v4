/**
 * Single lead parser
 */

import type { Lead } from "@/shared/types/lead";
import { isLead, detectProvider, type LeadInput } from "../../detection/detector";
import { parseAssurProspect } from "../assurprospect";
import { parseAssurland } from "../assurland";
import { transformToLead } from "../transformers";
import type { ParseResult } from "../types";

/**
 * Parses text/email and returns a Lead object ready for database
 * Returns null if input is not a valid lead or parsing fails
 */
export function parseLead(
  input: string | LeadInput,
  metadata?: { emailId?: string; source?: string }
): Lead | null {
  if (!isLead(input)) return null;

  const detection = detectProvider(input);
  if (detection.provider === "Unknown") return null;

  const text = typeof input === "string" ? input : input.text;

  let result: ParseResult;
  if (detection.provider === "AssurProspect") {
    result = parseAssurProspect(text);
  } else if (detection.provider === "Assurland") {
    result = parseAssurland(text);
  } else {
    return null;
  }

  if (!result.success || !result.data) return null;

  return transformToLead(result.data, metadata);
}

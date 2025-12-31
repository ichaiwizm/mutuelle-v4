/**
 * Lead and provider detection functions
 * Can work with plain text or email messages
 */

import { EXCLUSION_PATTERNS, type ProviderName } from "./patterns";
import { isLeadAssurProspect } from "./detectors/assurprospect-detector";
import { isLeadAssurland } from "./detectors/assurland-detector";
import {
  detectProvider,
  type ProviderDetectionResult,
  type LeadInput,
} from "./detectors/provider-detector";

export type { ProviderName, ProviderDetectionResult, LeadInput };
export { detectProvider };

/**
 * Determines if text contains a valid lead structure
 * Supports both AssurProspect (text/HTML) and Assurland (HTML table) formats
 */
export function isLead(input: string | LeadInput): boolean {
  const text = typeof input === "string" ? input : input.text;
  const subject = typeof input === "string" ? "" : input.subject || "";

  // Rule 1: Check exclusion patterns first
  if (EXCLUSION_PATTERNS.emptyBody(text)) return false;
  if (EXCLUSION_PATTERNS.emptyForward(subject, text)) return false;
  if (EXCLUSION_PATTERNS.tooShort(text)) return false;

  // Try AssurProspect format first (most common)
  if (isLeadAssurProspect(text)) return true;

  // Try Assurland format
  if (isLeadAssurland(text)) return true;

  return false;
}

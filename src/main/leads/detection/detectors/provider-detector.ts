/**
 * Provider detection with confidence scoring
 */

import {
  PROVIDER_PATTERNS,
  ASSURLAND_PATTERNS,
  ASSURLAND_TEXT_PATTERNS,
  type ProviderName,
} from "../patterns";

export type ProviderDetectionResult = {
  provider: ProviderName;
  confidence: "high" | "medium" | "low";
  signals: string[];
};

export type LeadInput = {
  text: string;
  subject?: string;
};

/**
 * Detects the provider from text content (with confidence scoring)
 */
export function detectProvider(input: string | LeadInput): ProviderDetectionResult {
  const signals: string[] = [];
  const text = (typeof input === "string" ? input : input.text).toLowerCase();
  const subject = (typeof input === "string" ? "" : input.subject || "").toLowerCase();

  // AssurProspect detection
  if (PROVIDER_PATTERNS.assurprospect.domain.test(text)) signals.push("assurprospect_domain");
  if (PROVIDER_PATTERNS.assurprospect.signature.test(text)) signals.push("assurprospect_signature");
  if (PROVIDER_PATTERNS.assurprospect.email.test(text)) signals.push("assurprospect_email");
  if (PROVIDER_PATTERNS.assurprospect.subject.test(subject)) signals.push("assurprospect_subject");
  if (PROVIDER_PATTERNS.assurprospect.structure.test(text)) signals.push("assurprospect_structure");

  const assurprospectCount = signals.filter((s) => s.startsWith("assurprospect")).length;

  // Assurland detection
  if (PROVIDER_PATTERNS.assurland.domain.test(text) || PROVIDER_PATTERNS.assurland.mention.test(text)) {
    signals.push("assurland_mention");
  }
  if (PROVIDER_PATTERNS.assurland.subject.test(subject)) signals.push("assurland_subject");
  if (ASSURLAND_PATTERNS.htmlTable.test(text) && ASSURLAND_PATTERNS.civilite.test(text)) {
    signals.push("assurland_table_structure");
  }
  if (ASSURLAND_TEXT_PATTERNS.civilite.test(text) && ASSURLAND_TEXT_PATTERNS.nom.test(text)) {
    signals.push("assurland_text_structure");
  }
  if (ASSURLAND_PATTERNS.serviceDataPro.test(text)) signals.push("assurland_datapro");

  const assurlandCount = signals.filter((s) => s.startsWith("assurland")).length;

  // Determine provider with confidence
  if (assurprospectCount >= 3) return { provider: "AssurProspect", confidence: "high", signals };
  if (assurprospectCount === 2) return { provider: "AssurProspect", confidence: "medium", signals };
  if (assurprospectCount >= 1) return { provider: "AssurProspect", confidence: "low", signals };
  if (assurlandCount >= 2) return { provider: "Assurland", confidence: "high", signals };
  if (assurlandCount === 1) return { provider: "Assurland", confidence: "medium", signals };

  return { provider: "Unknown", confidence: "low", signals: [] };
}

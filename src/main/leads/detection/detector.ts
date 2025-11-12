/**
 * Lead and provider detection functions
 * Can work with plain text or email messages
 */

import {
  LEAD_PATTERNS,
  PROVIDER_PATTERNS,
  EXCLUSION_PATTERNS,
  VALID_SUBJECT_PATTERNS,
  type ProviderName,
} from './patterns';

export type { ProviderName };

export type ProviderDetectionResult = {
  provider: ProviderName;
  confidence: 'high' | 'medium' | 'low';
  signals: string[];
};

export type LeadInput = {
  text: string;
  subject?: string;
};

/**
 * Determines if text contains a valid lead structure
 * Can accept plain text string or an object with text and optional subject
 */
export function isLead(input: string | LeadInput): boolean {
  // Normalize input
  const text = typeof input === 'string' ? input : input.text;
  const subject = typeof input === 'string' ? '' : (input.subject || '');

  // Rule 1: Check exclusion patterns first
  if (EXCLUSION_PATTERNS.emptyBody(text)) return false;
  if (EXCLUSION_PATTERNS.emptyForward(subject, text)) return false;
  if (EXCLUSION_PATTERNS.tooShort(text)) return false;

  // Rule 2: Must contain core structure markers
  if (!LEAD_PATTERNS.transmissionMarker.test(text)) return false;

  // Rule 3: Must contain required sections
  const hasContact = LEAD_PATTERNS.contactSection.test(text);
  const hasSouscripteur = LEAD_PATTERNS.souscripteurSection.test(text);
  const hasBesoin = LEAD_PATTERNS.besoinSection.test(text);

  if (!hasContact || !hasSouscripteur || !hasBesoin) return false;

  // Rule 4: Must contain minimum required fields
  const requiredFields = [
    LEAD_PATTERNS.civilite,
    LEAD_PATTERNS.nom,
    LEAD_PATTERNS.prenom,
    LEAD_PATTERNS.telephone,
    LEAD_PATTERNS.email,
    LEAD_PATTERNS.dateNaissance,
    LEAD_PATTERNS.regimeSocial,
    LEAD_PATTERNS.dateEffet,
  ];

  const hasAllFields = requiredFields.every((pattern) => pattern.test(text));
  if (!hasAllFields) return false;

  return true;
}

/**
 * Detects the provider from text content (with confidence scoring)
 * Can accept plain text string or an object with text and optional subject
 */
export function detectProvider(input: string | LeadInput): ProviderDetectionResult {
  const signals: string[] = [];
  const text = (typeof input === 'string' ? input : input.text).toLowerCase();
  const subject = (typeof input === 'string' ? '' : (input.subject || '')).toLowerCase();

  // AssurProspect detection
  if (PROVIDER_PATTERNS.assurprospect.domain.test(text)) {
    signals.push('assurprospect_domain');
  }
  if (PROVIDER_PATTERNS.assurprospect.signature.test(text)) {
    signals.push('assurprospect_signature');
  }
  if (PROVIDER_PATTERNS.assurprospect.email.test(text)) {
    signals.push('assurprospect_email');
  }
  if (PROVIDER_PATTERNS.assurprospect.subject.test(subject)) {
    signals.push('assurprospect_subject');
  }
  if (PROVIDER_PATTERNS.assurprospect.structure.test(text)) {
    signals.push('assurprospect_structure');
  }

  const assurprospectCount = signals.filter((s) => s.startsWith('assurprospect')).length;

  // Assurland detection
  if (PROVIDER_PATTERNS.assurland.domain.test(text) || PROVIDER_PATTERNS.assurland.mention.test(text)) {
    signals.push('assurland_mention');
  }
  if (PROVIDER_PATTERNS.assurland.subject.test(subject)) {
    signals.push('assurland_subject');
  }

  const assurlandCount = signals.filter((s) => s.startsWith('assurland')).length;

  // Determine provider with confidence
  if (assurprospectCount >= 3) {
    return { provider: 'AssurProspect', confidence: 'high', signals };
  }
  if (assurprospectCount === 2) {
    return { provider: 'AssurProspect', confidence: 'medium', signals };
  }
  if (assurprospectCount >= 1) {
    return { provider: 'AssurProspect', confidence: 'low', signals };
  }

  if (assurlandCount >= 2) {
    return { provider: 'Assurland', confidence: 'high', signals };
  }
  if (assurlandCount === 1) {
    return { provider: 'Assurland', confidence: 'medium', signals };
  }

  return { provider: 'Unknown', confidence: 'low', signals: [] };
}

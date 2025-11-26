/**
 * Lead and provider detection functions
 * Can work with plain text or email messages
 */

import {
  LEAD_PATTERNS,
  LEAD_HTML_PATTERNS,
  ASSURLAND_PATTERNS,
  ASSURLAND_TEXT_PATTERNS,
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
 * Supports both AssurProspect (text/HTML) and Assurland (HTML table) formats
 */
export function isLead(input: string | LeadInput): boolean {
  // Normalize input
  const text = typeof input === 'string' ? input : input.text;
  const subject = typeof input === 'string' ? '' : (input.subject || '');

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

/**
 * Checks if text matches AssurProspect lead format (text or HTML)
 */
function isLeadAssurProspect(text: string): boolean {
  // Must contain core structure marker
  if (!LEAD_PATTERNS.transmissionMarker.test(text)) return false;

  // Try text format first
  if (isLeadAssurProspectText(text)) return true;

  // Try HTML format
  if (isLeadAssurProspectHtml(text)) return true;

  return false;
}

/**
 * Checks if text matches AssurProspect text format
 */
function isLeadAssurProspectText(text: string): boolean {
  // Must contain required sections
  const hasContact = LEAD_PATTERNS.contactSection.test(text);
  const hasSouscripteur = LEAD_PATTERNS.souscripteurSection.test(text);
  const hasBesoin = LEAD_PATTERNS.besoinSection.test(text);

  if (!hasContact || !hasSouscripteur || !hasBesoin) return false;

  // Must contain minimum required fields
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

  return requiredFields.every((pattern) => pattern.test(text));
}

/**
 * Checks if text matches AssurProspect HTML format
 */
function isLeadAssurProspectHtml(text: string): boolean {
  // Must contain required sections (HTML format)
  const hasContact = LEAD_HTML_PATTERNS.contactSection.test(text);
  const hasSouscripteur = LEAD_HTML_PATTERNS.souscripteurSection.test(text);
  const hasBesoin = LEAD_HTML_PATTERNS.besoinSection.test(text);

  if (!hasContact || !hasSouscripteur || !hasBesoin) return false;

  // Must contain minimum required fields (HTML format)
  const requiredFields = [
    LEAD_HTML_PATTERNS.civilite,
    LEAD_HTML_PATTERNS.nom,
    LEAD_HTML_PATTERNS.prenom,
    LEAD_HTML_PATTERNS.telephone,
    LEAD_HTML_PATTERNS.email,
    LEAD_HTML_PATTERNS.dateNaissance,
    LEAD_HTML_PATTERNS.regimeSocial,
    LEAD_HTML_PATTERNS.dateEffet,
  ];

  return requiredFields.every((pattern) => pattern.test(text));
}

/**
 * Checks if text matches Assurland format (HTML table or text)
 */
function isLeadAssurland(text: string): boolean {
  // Try HTML table format first
  if (isLeadAssurlandHtml(text)) return true;

  // Try text format
  if (isLeadAssurlandText(text)) return true;

  return false;
}

/**
 * Checks if text matches Assurland HTML table format
 */
function isLeadAssurlandHtml(text: string): boolean {
  // Must have HTML table structure
  if (!ASSURLAND_PATTERNS.htmlTable.test(text)) return false;

  // Must have Assurland signature
  if (!ASSURLAND_PATTERNS.assurlandSignature.test(text)) return false;

  // Must have required fields in HTML table format
  const requiredFields = [
    ASSURLAND_PATTERNS.civilite,
    ASSURLAND_PATTERNS.nom,
    ASSURLAND_PATTERNS.prenom,
    ASSURLAND_PATTERNS.telephone,
    ASSURLAND_PATTERNS.email,
    ASSURLAND_PATTERNS.dateNaissance,
    ASSURLAND_PATTERNS.regimeSocial,
  ];

  return requiredFields.every((pattern) => pattern.test(text));
}

/**
 * Checks if text matches Assurland text format (tab-separated)
 */
function isLeadAssurlandText(text: string): boolean {
  // Must have required fields in tab-separated format
  const requiredFields = [
    ASSURLAND_TEXT_PATTERNS.civilite,
    ASSURLAND_TEXT_PATTERNS.nom,
    ASSURLAND_TEXT_PATTERNS.prenom,
    ASSURLAND_TEXT_PATTERNS.telephone,
    ASSURLAND_TEXT_PATTERNS.email,
    ASSURLAND_TEXT_PATTERNS.dateNaissance,
    ASSURLAND_TEXT_PATTERNS.regimeSocial,
  ];

  return requiredFields.every((pattern) => pattern.test(text));
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
  // Check for Assurland HTML table structure
  if (ASSURLAND_PATTERNS.htmlTable.test(text) && ASSURLAND_PATTERNS.civilite.test(text)) {
    signals.push('assurland_table_structure');
  }
  // Check for Assurland text format (tab-separated)
  if (ASSURLAND_TEXT_PATTERNS.civilite.test(text) && ASSURLAND_TEXT_PATTERNS.nom.test(text)) {
    signals.push('assurland_text_structure');
  }
  // Check for DataPro service signature
  if (ASSURLAND_PATTERNS.serviceDataPro.test(text)) {
    signals.push('assurland_datapro');
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

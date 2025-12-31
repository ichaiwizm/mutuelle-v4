/**
 * AssurProspect lead detection
 */

import { LEAD_PATTERNS, LEAD_HTML_PATTERNS } from "../patterns";

/**
 * Checks if text matches AssurProspect lead format (text or HTML)
 */
export function isLeadAssurProspect(text: string): boolean {
  if (!LEAD_PATTERNS.transmissionMarker.test(text)) return false;
  if (isLeadAssurProspectText(text)) return true;
  if (isLeadAssurProspectHtml(text)) return true;
  return false;
}

/**
 * Checks if text matches AssurProspect text format
 */
function isLeadAssurProspectText(text: string): boolean {
  const hasContact = LEAD_PATTERNS.contactSection.test(text);
  const hasSouscripteur = LEAD_PATTERNS.souscripteurSection.test(text);
  const hasBesoin = LEAD_PATTERNS.besoinSection.test(text);

  if (!hasContact || !hasSouscripteur || !hasBesoin) return false;

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
  const hasContact = LEAD_HTML_PATTERNS.contactSection.test(text);
  const hasSouscripteur = LEAD_HTML_PATTERNS.souscripteurSection.test(text);
  const hasBesoin = LEAD_HTML_PATTERNS.besoinSection.test(text);

  if (!hasContact || !hasSouscripteur || !hasBesoin) return false;

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

/**
 * Assurland lead detection
 */

import { ASSURLAND_PATTERNS, ASSURLAND_TEXT_PATTERNS } from "../patterns";

/**
 * Checks if text matches Assurland format (HTML table or text)
 */
export function isLeadAssurland(text: string): boolean {
  if (isLeadAssurlandHtml(text)) return true;
  if (isLeadAssurlandText(text)) return true;
  return false;
}

/**
 * Checks if text matches Assurland HTML table format
 */
function isLeadAssurlandHtml(text: string): boolean {
  if (!ASSURLAND_PATTERNS.htmlTable.test(text)) return false;
  if (!ASSURLAND_PATTERNS.assurlandSignature.test(text)) return false;

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

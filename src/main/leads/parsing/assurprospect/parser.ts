/**
 * AssurProspect-specific parser
 * Supports both text and HTML formats
 */

import { splitIntoSections, extractFields } from '../extractors';
import type { ParseResult } from '../types';
import {
  buildContact,
  buildPerson,
  buildConjoint,
  buildBesoin,
  extractChildren,
  extractChildrenFromHtml,
} from './builders';
import { extractHtmlFields } from './htmlExtractor';
import { hasData } from './utils';

/**
 * Parse AssurProspect email into structured lead data
 * Auto-detects format (HTML or text)
 */
export function parseAssurProspect(text: string): ParseResult {
  // Detect HTML format and use appropriate parser
  if (text.includes('<html') || text.includes('<strong>')) {
    return parseAssurProspectHtml(text);
  }

  return parseAssurProspectText(text);
}

/**
 * Parse AssurProspect text format (standard email)
 */
function parseAssurProspectText(text: string): ParseResult {
  try {
    const sections = splitIntoSections(text);
    const warnings: string[] = [];

    // Extract Contact
    const contact = sections.contact ? buildContact(extractFields(sections.contact)) : undefined;
    if (!contact?.email) warnings.push('Missing contact email');

    // Extract Souscripteur
    const souscripteur = sections.souscripteur
      ? buildPerson(extractFields(sections.souscripteur))
      : undefined;
    if (!souscripteur?.dateNaissance) warnings.push('Missing birth date');

    // Extract Conjoint (optional)
    const conjoint = sections.conjoint ? buildPerson(extractFields(sections.conjoint)) : undefined;

    // Extract Enfants (optional)
    const enfants = sections.enfants ? extractChildren(sections.enfants) : undefined;

    // Build besoin
    const besoin = sections.besoin ? buildBesoin(extractFields(sections.besoin)) : undefined;

    return {
      success: true,
      data: { contact, souscripteur, conjoint, enfants, besoin },
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown parsing error'],
    };
  }
}

/**
 * Parse AssurProspect HTML format (forwarded emails)
 * Format: <strong>Field :</strong>&nbsp;Value<br>
 */
function parseAssurProspectHtml(html: string): ParseResult {
  try {
    const fields = extractHtmlFields(html);
    const warnings: string[] = [];

    // Build contact
    const contact = buildContact(fields);
    if (!contact.email) warnings.push('Missing contact email');

    // Build souscripteur
    const souscripteur = buildPerson(fields);
    if (!souscripteur.dateNaissance) warnings.push('Missing birth date');

    // Build conjoint (if conjoint section exists)
    const conjoint = buildConjoint(fields);

    // Extract enfants from HTML
    const enfants = extractChildrenFromHtml(html);

    // Build besoin
    const besoin = buildBesoin(fields);

    return {
      success: true,
      data: {
        contact,
        souscripteur,
        conjoint: hasData(conjoint) ? conjoint : undefined,
        enfants: enfants.length > 0 ? enfants : undefined,
        besoin,
      },
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown parsing error'],
    };
  }
}

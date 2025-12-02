/**
 * Assurland-specific parser
 *
 * Supports two formats:
 * 1. HTML table: <tr><td><b>Field</b></td><td>Value</td></tr>
 * 2. Text (tab-separated): Field\tValue
 */

import type { ParseResult } from '../types';
import { extractTextFields, extractHtmlTableFields } from './extractors';
import { buildContact, buildSouscripteur, buildConjoint, buildEnfants, buildBesoin } from './builders';
import { hasData } from './utils';

/**
 * Parse Assurland email into structured lead data
 * Auto-detects format (HTML table or text tab-separated)
 */
export function parseAssurland(text: string): ParseResult {
  // Detect format and use appropriate parser
  if (text.includes('<table') || text.includes('<tr>')) {
    return parseAssurlandHtml(text);
  }
  return parseAssurlandText(text);
}

/**
 * Parse Assurland text format (tab-separated)
 * Format: Field\tValue
 */
function parseAssurlandText(text: string): ParseResult {
  try {
    // Extract all field-value pairs from tab-separated text
    const fields = extractTextFields(text);

    if (Object.keys(fields).length === 0) {
      return {
        success: false,
        errors: ['No data found in text'],
      };
    }

    return buildResult(fields);
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown parsing error'],
    };
  }
}

/**
 * Parse Assurland HTML table format
 */
function parseAssurlandHtml(text: string): ParseResult {
  try {
    // Extract all field-value pairs from HTML table
    const fields = extractHtmlTableFields(text);

    if (Object.keys(fields).length === 0) {
      return {
        success: false,
        errors: ['No data found in HTML table'],
      };
    }

    return buildResult(fields);
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown parsing error'],
    };
  }
}

/**
 * Build the final ParseResult from extracted fields
 */
function buildResult(fields: Record<string, string>): ParseResult {
  const warnings: string[] = [];

  // Build contact
  const contact = buildContact(fields);
  if (!contact.email) warnings.push('Missing email');
  if (!contact.nom) warnings.push('Missing nom');

  // Build souscripteur
  const souscripteur = buildSouscripteur(fields);
  if (!souscripteur.dateNaissance) warnings.push('Missing date de naissance');

  // Build conjoint (if present)
  const conjoint = buildConjoint(fields);

  // Build enfants (from min/max dates if present)
  const enfants = buildEnfants(fields);

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
}

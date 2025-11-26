/**
 * Assurland-specific parser
 *
 * Supports two formats:
 * 1. HTML table: <tr><td><b>Field</b></td><td>Value</td></tr>
 * 2. Text (tab-separated): Field\tValue
 */

import type { ParseResult, ExtractedContact, ExtractedPerson, ExtractedChild, ExtractedBesoin } from './types';

/**
 * Field name mappings from Assurland to internal names
 */
const FIELD_MAPPINGS: Record<string, string> = {
  // Contact fields
  'civilite': 'civilite',
  'nom': 'nom',
  'prenom': 'prenom',
  'v4': 'adresse', // Assurland uses v4 for address
  'code postal': 'codePostal',
  'ville': 'ville',
  'telephone portable': 'telephone',
  'telephone domicile': 'telephoneDomicile',
  'email': 'email',

  // Souscripteur fields
  'date de naissance': 'dateNaissance',
  'age': 'age',
  'sexe': 'sexe',
  'profession': 'profession',
  'regime social': 'regimeSocial',
  'situation familiale': 'situationFamiliale',
  'nombre d\'enfants': 'nombreEnfants',

  // Conjoint fields
  'date de naissance conjoint': 'conjointDateNaissance',
  'regime social conjoint': 'conjointRegimeSocial',
  'profession conjoint': 'conjointProfession',

  // Children fields (min/max dates)
  'date de naissance enfants min': 'enfantsDateMin',
  'date de naissance enfants max': 'enfantsDateMax',

  // Besoin fields
  'besoin assurance sante': 'besoinMotif',
  'mois d\'echeance': 'moisEcheance',
  'assureur actuel': 'assureurActuel',
  'formule choisie': 'formuleChoisie',

  // Internal ID
  'user_id': 'userId',
};

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
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown parsing error'],
    };
  }
}

/**
 * Extract field-value pairs from tab-separated text
 * Format: Field\tValue (one per line)
 */
function extractTextFields(text: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const lines = text.split('\n');

  for (const line of lines) {
    // Split by tab
    const parts = line.split('\t');
    if (parts.length >= 2) {
      const rawField = parts[0].trim().toLowerCase();
      const rawValue = parts.slice(1).join('\t').trim();

      // Map field name to internal name
      const fieldName = FIELD_MAPPINGS[rawField] || rawField;

      if (rawValue && rawValue !== 'NON RENSEIGNE') {
        fields[fieldName] = rawValue;
      }
    }
  }

  return fields;
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
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown parsing error'],
    };
  }
}

/**
 * Extract field-value pairs from HTML table rows
 * Handles format: <tr><td><b>Field</b></td><td>Value</td></tr>
 */
function extractHtmlTableFields(html: string): Record<string, string> {
  const fields: Record<string, string> = {};

  // Pattern to match table rows with field-value pairs
  // Handles both <b>Field</b> and plain Field formats
  const rowPattern = /<tr[^>]*>\s*<td[^>]*>(?:<b>)?([^<]+)(?:<\/b>)?<\/td>\s*<td[^>]*>([^<]*?)(?:&nbsp;)*<\/td>\s*<\/tr>/gi;

  let match;
  while ((match = rowPattern.exec(html)) !== null) {
    const rawField = match[1].trim().toLowerCase();
    const rawValue = cleanValue(match[2]);

    // Map field name to internal name
    const fieldName = FIELD_MAPPINGS[rawField] || rawField;

    if (rawValue && rawValue !== 'NON RENSEIGNE') {
      fields[fieldName] = rawValue;
    }
  }

  return fields;
}

/**
 * Clean extracted value (remove &nbsp;, trim, etc.)
 */
function cleanValue(value: string): string {
  return value
    .replace(/&nbsp;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Build contact object from extracted fields
 */
function buildContact(fields: Record<string, string>): ExtractedContact {
  return {
    civilite: normalizeCivilite(fields.civilite),
    nom: fields.nom,
    prenom: fields.prenom,
    adresse: fields.adresse,
    codePostal: fields.codePostal,
    ville: fields.ville,
    telephone: cleanPhone(fields.telephone || fields.telephoneDomicile),
    email: cleanEmail(fields.email),
  };
}

/**
 * Build souscripteur object from extracted fields
 */
function buildSouscripteur(fields: Record<string, string>): ExtractedPerson {
  const person: ExtractedPerson = {
    dateNaissance: fields.dateNaissance,
    profession: fields.profession,
    regimeSocial: normalizeRegimeSocial(fields.regimeSocial),
  };

  const nombreEnfants = parseNumeric(fields.nombreEnfants);
  if (nombreEnfants !== undefined) {
    person.nombreEnfants = nombreEnfants;
  }

  return person;
}

/**
 * Build conjoint object from extracted fields
 */
function buildConjoint(fields: Record<string, string>): ExtractedPerson {
  return {
    dateNaissance: fields.conjointDateNaissance,
    profession: fields.conjointProfession,
    regimeSocial: normalizeRegimeSocial(fields.conjointRegimeSocial),
  };
}

/**
 * Build enfants array from min/max date fields
 * Assurland provides min and max birth dates for children
 */
function buildEnfants(fields: Record<string, string>): ExtractedChild[] {
  const enfants: ExtractedChild[] = [];

  // If we have min date, add as first child
  if (fields.enfantsDateMin && isValidDate(fields.enfantsDateMin)) {
    enfants.push({ dateNaissance: fields.enfantsDateMin, order: 1 });
  }

  // If we have max date and it's different from min, add as second child
  if (fields.enfantsDateMax && isValidDate(fields.enfantsDateMax)) {
    if (fields.enfantsDateMax !== fields.enfantsDateMin) {
      enfants.push({ dateNaissance: fields.enfantsDateMax, order: 2 });
    }
  }

  return enfants;
}

/**
 * Build besoin object from extracted fields
 */
function buildBesoin(fields: Record<string, string>): ExtractedBesoin {
  // Assurland doesn't have the same besoin structure as AssurProspect
  // We map what we can
  return {
    // Note: Assurland doesn't provide dateEffet in the same way
    actuellementAssure: fields.assureurActuel ? true : undefined,
  };
}

/**
 * Check if an object has any non-undefined values
 */
function hasData(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some(v => v !== undefined && v !== '');
}

/**
 * Normalize civilite to standard format
 */
function normalizeCivilite(value?: string): string | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  if (lower.includes('monsieur') || lower === 'm') return 'M';
  if (lower.includes('madame') || lower === 'mme') return 'Mme';
  if (lower.includes('mademoiselle') || lower === 'mlle') return 'Mlle';
  return value;
}

/**
 * Normalize regime social to standard format
 */
function normalizeRegimeSocial(value?: string): string | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();

  if (lower.includes('tns') || lower.includes('travailleurs non salariés') || lower.includes('indépendants')) {
    return 'TNS';
  }
  if (lower.includes('général') || lower.includes('salari')) {
    return 'Général';
  }
  if (lower.includes('agricole') || lower.includes('msa')) {
    return 'Agricole';
  }
  if (lower.includes('alsace') || lower.includes('moselle')) {
    return 'Alsace-Moselle';
  }

  return value;
}

/**
 * Clean and validate email
 */
function cleanEmail(value?: string): string | undefined {
  if (!value) return undefined;
  const match = value.match(/([^\s<>]+@[^\s<>]+\.[^\s<>]+)/);
  return match ? match[1].toLowerCase() : undefined;
}

/**
 * Clean phone number
 */
function cleanPhone(value?: string): string | undefined {
  if (!value) return undefined;
  // Remove all non-digit characters except leading +
  const cleaned = value.replace(/[^\d+]/g, '');
  return cleaned || undefined;
}

/**
 * Parse numeric value
 */
function parseNumeric(value?: string): number | undefined {
  if (!value) return undefined;
  const num = parseInt(value, 10);
  return isNaN(num) ? undefined : num;
}

/**
 * Check if string is a valid date format (DD/MM/YYYY)
 */
function isValidDate(value: string): boolean {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
}

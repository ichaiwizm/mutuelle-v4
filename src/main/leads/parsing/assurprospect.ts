/**
 * AssurProspect-specific parser
 * Supports both text and HTML formats
 */

import { splitIntoSections, extractFields } from './extractors';
import type { ParseResult, ExtractedContact, ExtractedPerson, ExtractedChild, ExtractedBesoin } from './types';

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
    const contact = sections.contact ? parseContact(extractFields(sections.contact)) : undefined;
    if (!contact?.email) warnings.push('Missing contact email');

    // Extract Souscripteur
    const souscripteur = sections.souscripteur
      ? parsePerson(extractFields(sections.souscripteur))
      : undefined;
    if (!souscripteur?.dateNaissance) warnings.push('Missing birth date');

    // Extract Conjoint (optional)
    const conjoint = sections.conjoint ? parsePerson(extractFields(sections.conjoint)) : undefined;

    // Extract Enfants (optional)
    const enfants = sections.enfants ? extractChildren(sections.enfants) : undefined;

    // Extract Besoin
    const besoin = sections.besoin ? parseBesoin(extractFields(sections.besoin)) : undefined;

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

function parseContact(fields: Record<string, string>): ExtractedContact {
  return {
    civilite: fields.civilite,
    nom: fields.nom,
    prenom: fields.prenom,
    adresse: fields.adresse,
    codePostal: fields.codePostal,
    ville: fields.ville,
    telephone: cleanPhone(fields.telephone),
    email: cleanEmail(fields.email),
  };
}

function parsePerson(fields: Record<string, string>): ExtractedPerson {
  const person: ExtractedPerson = {
    dateNaissance: fields.dateNaissance,
    profession: fields.profession,
    regimeSocial: fields.regimeSocial,
  };

  const nombreEnfants = parseNumeric(fields.nombreEnfants);
  if (nombreEnfants !== undefined) {
    person.nombreEnfants = nombreEnfants;
  }

  return person;
}

function parseBesoin(fields: Record<string, string>): ExtractedBesoin {
  return {
    dateEffet: fields.dateEffet,
    actuellementAssure: fields.actuellementAssure === 'Oui',
    soinsMedicaux: parseNumeric(fields.soinsMedicaux),
    hospitalisation: parseNumeric(fields.hospitalisation),
    optique: parseNumeric(fields.optique),
    dentaire: parseNumeric(fields.dentaire),
  };
}

function extractChildren(text: string): ExtractedChild[] {
  const children: ExtractedChild[] = [];
  const pattern = /Date de naissance du (\d+)(?:er|ème) enfant\s*:\s*(\d{2}\/\d{2}\/\d{4})/gi;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    children.push({
      order: parseInt(match[1], 10),
      dateNaissance: match[2],
    });
  }

  return children.sort((a, b) => (a.order || 0) - (b.order || 0));
}

function cleanEmail(value?: string): string | undefined {
  if (!value) return undefined;
  const match = value.match(/([^\s<]+@[^\s>]+)/);
  return match ? match[1] : value;
}

function cleanPhone(value?: string): string | undefined {
  return value?.trim();
}

function parseNumeric(value?: string): number | undefined {
  if (!value) return undefined;
  const num = parseInt(value, 10);
  return isNaN(num) ? undefined : num;
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
    const contact: ExtractedContact = {
      civilite: fields.civilite,
      nom: fields.nom,
      prenom: fields.prenom,
      adresse: fields.adresse,
      codePostal: fields.codePostal,
      ville: fields.ville,
      telephone: cleanPhone(fields.telephone),
      email: cleanEmail(fields.email),
    };
    if (!contact.email) warnings.push('Missing contact email');

    // Build souscripteur
    const souscripteur: ExtractedPerson = {
      dateNaissance: fields.dateNaissance,
      profession: fields.profession,
      regimeSocial: fields.regimeSocial,
    };
    const nombreEnfants = parseNumeric(fields.nombreEnfants);
    if (nombreEnfants !== undefined) {
      souscripteur.nombreEnfants = nombreEnfants;
    }
    if (!souscripteur.dateNaissance) warnings.push('Missing birth date');

    // Build conjoint (if conjoint section exists)
    let conjoint: ExtractedPerson | undefined;
    if (fields.conjointDateNaissance) {
      conjoint = {
        dateNaissance: fields.conjointDateNaissance,
        profession: fields.conjointProfession,
        regimeSocial: fields.conjointRegimeSocial,
      };
    }

    // Extract enfants from HTML
    const enfants = extractChildrenFromHtml(html);

    // Build besoin
    const besoin: ExtractedBesoin = {
      dateEffet: fields.dateEffet,
      actuellementAssure: fields.actuellementAssure === 'Oui',
      soinsMedicaux: parseNumeric(fields.soinsMedicaux),
      hospitalisation: parseNumeric(fields.hospitalisation),
      optique: parseNumeric(fields.optique),
      dentaire: parseNumeric(fields.dentaire),
    };

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
 * Extract field-value pairs from HTML format
 * Handles: <strong>Field :</strong>&nbsp;Value<br>
 */
function extractHtmlFields(html: string): Record<string, string> {
  const fields: Record<string, string> = {};

  // Pattern for <strong>Field :</strong>&nbsp;Value<br> or <strong>Field :</strong>&nbsp;<span>Value</span><br>
  const fieldPattern = /<strong>([^<]+)\s*:<\/strong>&nbsp;(?:<[^>]*>)?([^<]*)(?:<\/[^>]*>)?<br>/gi;

  let match;
  let currentSection = '';

  // First detect sections to handle conjoint fields
  const sectionPattern = /<h2><strong>(\w+)<\/strong><\/h2>/gi;
  const sections: Array<{ name: string; index: number }> = [];
  while ((match = sectionPattern.exec(html)) !== null) {
    sections.push({ name: match[1].toLowerCase(), index: match.index });
  }

  // Reset regex
  fieldPattern.lastIndex = 0;

  while ((match = fieldPattern.exec(html)) !== null) {
    const rawField = match[1].trim();
    const rawValue = cleanHtmlValue(match[2]);

    // Determine current section based on position
    for (let i = sections.length - 1; i >= 0; i--) {
      if (match.index > sections[i].index) {
        currentSection = sections[i].name;
        break;
      }
    }

    // Map field name to internal name
    const fieldName = normalizeHtmlFieldName(rawField, currentSection);

    if (rawValue) {
      fields[fieldName] = rawValue;
    }
  }

  return fields;
}

/**
 * Normalize HTML field names to internal format
 */
function normalizeHtmlFieldName(field: string, section: string): string {
  const lower = field.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const mapping: Record<string, string> = {
    'civilite': 'civilite',
    'nom': 'nom',
    'prenom': 'prenom',
    'adresse': 'adresse',
    'code postal': 'codePostal',
    'ville': 'ville',
    'telephone': 'telephone',
    'email': 'email',
    'date de naissance': section === 'conjoint' ? 'conjointDateNaissance' : 'dateNaissance',
    'profession': section === 'conjoint' ? 'conjointProfession' : 'profession',
    'regime social': section === 'conjoint' ? 'conjointRegimeSocial' : 'regimeSocial',
    "nombre d'enfants": 'nombreEnfants',
    "date d'effet": 'dateEffet',
    'souscripteur actuellement assure': 'actuellementAssure',
    'soins medicaux': 'soinsMedicaux',
    'hospitalisation': 'hospitalisation',
    'optique': 'optique',
    'dentaire': 'dentaire',
  };

  return mapping[lower] || lower;
}

/**
 * Clean HTML value (remove &nbsp; and trim)
 */
function cleanHtmlValue(value: string): string {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract children from HTML format
 */
function extractChildrenFromHtml(html: string): ExtractedChild[] {
  const children: ExtractedChild[] = [];
  const pattern = /<strong>Date de naissance du (\d+)(?:er|ème) enfant\s*:<\/strong>&nbsp;(?:<[^>]*>)?(\d{2}\/\d{2}\/\d{4})(?:<\/[^>]*>)?/gi;
  let match;

  while ((match = pattern.exec(html)) !== null) {
    children.push({
      order: parseInt(match[1], 10),
      dateNaissance: match[2],
    });
  }

  return children.sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * Check if an object has any non-undefined values
 */
function hasData(obj: Record<string, unknown> | undefined): boolean {
  if (!obj) return false;
  return Object.values(obj).some(v => v !== undefined && v !== '');
}

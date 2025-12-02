import { cleanHtmlValue } from './utils';

/**
 * Field name mapping for HTML format
 */
const HTML_FIELD_MAPPING: Record<string, string> = {
  'civilite': 'civilite',
  'nom': 'nom',
  'prenom': 'prenom',
  'adresse': 'adresse',
  'code postal': 'codePostal',
  'ville': 'ville',
  'telephone': 'telephone',
  'email': 'email',
  "nombre d'enfants": 'nombreEnfants',
  "date d'effet": 'dateEffet',
  'souscripteur actuellement assure': 'actuellementAssure',
  'soins medicaux': 'soinsMedicaux',
  'hospitalisation': 'hospitalisation',
  'optique': 'optique',
  'dentaire': 'dentaire',
};

/**
 * Normalize HTML field names to internal format
 */
function normalizeHtmlFieldName(field: string, section: string): string {
  const lower = field.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Handle section-specific fields
  if (lower === 'date de naissance') {
    return section === 'conjoint' ? 'conjointDateNaissance' : 'dateNaissance';
  }
  if (lower === 'profession') {
    return section === 'conjoint' ? 'conjointProfession' : 'profession';
  }
  if (lower === 'regime social') {
    return section === 'conjoint' ? 'conjointRegimeSocial' : 'regimeSocial';
  }

  return HTML_FIELD_MAPPING[lower] || lower;
}

/**
 * Extract field-value pairs from HTML format
 * Handles: <strong>Field :</strong>&nbsp;Value<br>
 */
export function extractHtmlFields(html: string): Record<string, string> {
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

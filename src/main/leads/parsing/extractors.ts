/**
 * Field extraction utilities
 */

import type { ExtractedContact, ExtractedPerson, ExtractedChild, ExtractedBesoin, SectionMap } from './types';

const FIELD_PATTERN = /^(.+?)\s*:\s*(.+)$/;

/**
 * Splits email text into sections
 */
export function splitIntoSections(text: string): SectionMap {
  const normalized = text.replace(/\r\n/g, '\n');
  const startMatch = normalized.match(/Transmission d['']une fiche/i);
  if (!startMatch || !startMatch.index) return {};

  const relevantText = normalized.slice(startMatch.index);
  const footerMatch = relevantText.match(/\n\s*A noter\s*:/i);
  const contentText = footerMatch && footerMatch.index
    ? relevantText.slice(0, footerMatch.index)
    : relevantText;

  return extractSections(contentText);
}

function extractSections(text: string): SectionMap {
  const sections: SectionMap = {};
  const lines = text.split('\n');
  let currentSection: keyof SectionMap | null = null;
  let sectionContent: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const sectionType = detectSectionHeader(trimmed);

    if (sectionType) {
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection] = sectionContent.join('\n');
      }
      currentSection = sectionType;
      sectionContent = [];
    } else if (currentSection && trimmed) {
      sectionContent.push(trimmed);
    }
  }

  if (currentSection && sectionContent.length > 0) {
    sections[currentSection] = sectionContent.join('\n');
  }

  return sections;
}

function detectSectionHeader(line: string): keyof SectionMap | null {
  if (/^Contact\s*$/i.test(line)) return 'contact';
  if (/^Souscripteur\s*$/i.test(line)) return 'souscripteur';
  if (/^Conjoint\s*$/i.test(line)) return 'conjoint';
  if (/^Enfants\s*$/i.test(line)) return 'enfants';
  if (/^Besoin\s*$/i.test(line)) return 'besoin';
  return null;
}

/**
 * Extracts fields from section text using "Label : Value" pattern
 */
export function extractFields(text: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const lines = text.split('\n');

  for (const line of lines) {
    const match = line.trim().match(FIELD_PATTERN);
    if (match) {
      const [, label, value] = match;
      const normalizedKey = normalizeFieldName(label.trim());
      fields[normalizedKey] = value.trim();
    }
  }

  return fields;
}

function normalizeFieldName(label: string): string {
  const cleaned = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const mapping: Record<string, string> = {
    civilite: 'civilite',
    nom: 'nom',
    prenom: 'prenom',
    adresse: 'adresse',
    'code postal': 'codePostal',
    ville: 'ville',
    telephone: 'telephone',
    email: 'email',
    'date de naissance': 'dateNaissance',
    profession: 'profession',
    'regime social': 'regimeSocial',
    "nombre d'enfants": 'nombreEnfants',
    "date d'effet": 'dateEffet',
    'souscripteur actuellement assure': 'actuellementAssure',
    'soins medicaux': 'soinsMedicaux',
    hospitalisation: 'hospitalisation',
    optique: 'optique',
    dentaire: 'dentaire',
  };

  return mapping[cleaned] || cleaned;
}

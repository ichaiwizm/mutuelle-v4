/**
 * Field extraction utilities
 */

import type { ExtractedContact, ExtractedPerson, ExtractedChild, ExtractedBesoin, SectionMap } from './types';

const FIELD_PATTERN = /^(.+?)\s*:\s*(.+)$/;

/**
 * Splits email text into multiple lead blocks
 * Returns array of text blocks (one per lead)
 * Each block includes everything from "Transmission" to before the next "Transmission"
 * or until the end of the email
 */
export function splitEmailIntoLeadBlocks(text: string): string[] {
  // Remove email quote markers (> at start of lines)
  let normalized = text.replace(/\r\n/g, '\n');
  normalized = normalized.replace(/^>\s?/gm, '');
  const transmissionPattern = /Transmission d['']une fiche/gi;

  const matches: Array<{ index: number }> = [];
  let match;
  while ((match = transmissionPattern.exec(normalized)) !== null) {
    matches.push({ index: match.index });
  }

  if (matches.length === 0) return [];
  if (matches.length === 1) return [normalized];

  // Split blocks at each "Transmission d'une fiche"
  // Include preamble text before first transmission in first block
  const blocks: string[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = i === 0 ? 0 : matches[i].index;
    const end = i < matches.length - 1 ? matches[i + 1].index : normalized.length;
    blocks.push(normalized.slice(start, end));
  }

  return blocks;
}

/**
 * Splits email text into sections
 * Handles both full emails and isolated lead blocks
 */
export function splitIntoSections(text: string): SectionMap {
  // Remove email quote markers (> at start of lines)
  let normalized = text.replace(/\r\n/g, '\n');
  normalized = normalized.replace(/^>\s?/gm, '');
  const startMatch = normalized.match(/Transmission d['']une fiche/i);
  if (!startMatch || startMatch.index === undefined) return {};

  // Extract relevant text (from "Transmission" to footer or end)
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

/**
 * Section splitting utilities
 */

import { normalizeText } from "../normalizers";
import type { SectionMap } from "../types";

/**
 * Splits email text into sections
 */
export function splitIntoSections(text: string): SectionMap {
  const normalized = normalizeText(text, { removeEmailQuotes: true });
  const startMatch = normalized.match(/Transmission d['']une fiche/i);
  if (!startMatch || startMatch.index === undefined) return {};

  const relevantText = normalized.slice(startMatch.index);
  const footerMatch = relevantText.match(/\n\s*A noter\s*:/i);
  const contentText = footerMatch?.index
    ? relevantText.slice(0, footerMatch.index)
    : relevantText;

  return extractSections(contentText);
}

function extractSections(text: string): SectionMap {
  const sections: SectionMap = {};
  const lines = text.split("\n");
  let currentSection: keyof SectionMap | null = null;
  let sectionContent: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const sectionType = detectSectionHeader(trimmed);

    if (sectionType) {
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection] = sectionContent.join("\n");
      }
      currentSection = sectionType;
      sectionContent = [];
    } else if (currentSection && trimmed) {
      sectionContent.push(trimmed);
    }
  }

  if (currentSection && sectionContent.length > 0) {
    sections[currentSection] = sectionContent.join("\n");
  }

  return sections;
}

function detectSectionHeader(line: string): keyof SectionMap | null {
  if (/^Contact\s*$/i.test(line)) return "contact";
  if (/^Souscripteur\s*$/i.test(line)) return "souscripteur";
  if (/^Conjoint\s*$/i.test(line)) return "conjoint";
  if (/^Enfants\s*$/i.test(line)) return "enfants";
  if (/^Besoin\s*$/i.test(line)) return "besoin";
  return null;
}

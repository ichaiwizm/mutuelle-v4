/**
 * Email block splitting utilities
 */

import { normalizeText } from "../normalizers";

/**
 * Splits email text into multiple lead blocks
 * Returns array of text blocks (one per lead)
 */
export function splitEmailIntoLeadBlocks(text: string): string[] {
  const normalized = normalizeText(text, { removeEmailQuotes: true });
  const transmissionPattern = /Transmission d['']une fiche/gi;

  const matches: Array<{ index: number }> = [];
  let match;
  while ((match = transmissionPattern.exec(normalized)) !== null) {
    matches.push({ index: match.index });
  }

  if (matches.length === 0) return [];
  if (matches.length === 1) return [normalized];

  const blocks: string[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = i === 0 ? 0 : matches[i].index;
    const end = i < matches.length - 1 ? matches[i + 1].index : normalized.length;
    blocks.push(normalized.slice(start, end));
  }

  return blocks;
}

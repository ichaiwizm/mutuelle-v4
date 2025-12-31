/**
 * Exclusion and validation patterns
 */

/** Subject patterns for valid leads */
export const VALID_SUBJECT_PATTERNS = [
  /^Fiche trio Mutuelle Sante AssurProspect\.fr/i,
  /^LEAD\s*\d*$/i,
] as const;

/** Exclusion patterns (invalid leads) */
export const EXCLUSION_PATTERNS = {
  emptyBody: (text: string) => !text || text.trim().length === 0,
  emptyForward: (subject: string, text: string) =>
    subject.includes("Fwd:") && (!text || text.trim().length === 0),
  tooShort: (text: string) => text.trim().length < 500,
} as const;

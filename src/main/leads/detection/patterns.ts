/**
 * Detection patterns for lead emails
 */

export type ProviderName = 'AssurProspect' | 'Assurland' | 'Unknown';

/**
 * Patterns to identify valid lead emails
 */
export const LEAD_PATTERNS = {
  // Core structure markers (must be present)
  transmissionMarker: /Transmission d['']une fiche/i,
  ficheTrioMarker: /fiche trio/i,

  // Required sections
  contactSection: /\bContact\s*$/m,
  souscripteurSection: /\bSouscripteur\s*$/m,
  besoinSection: /\bBesoin\s*$/m,

  // Required fields (minimum for valid lead)
  civilite: /Civilité\s*:/i,
  nom: /Nom\s*:/i,
  prenom: /Prénom\s*:/i,
  telephone: /Téléphone\s*:/i,
  email: /Email\s*:/i,
  dateNaissance: /Date de naissance\s*:/i,
  regimeSocial: /Régime Social\s*:/i,
  dateEffet: /Date d['']effet\s*:/i,
} as const;

/**
 * Provider detection patterns
 */
export const PROVIDER_PATTERNS = {
  assurprospect: {
    domain: /assurprospect\.fr/i,
    signature: /L['']équipe AssurProspect/i,
    email: /contact@assurprospect\.fr/i,
    subject: /AssurProspect\.fr/i,
    structure: /Transmission d['']une fiche.*fiche trio/is,
  },
  assurland: {
    domain: /assurland\.com/i,
    mention: /\bassurland\b/i,
    subject: /assurland/i,
    from: /noreply@assurland\.com/i,
  },
} as const;

/**
 * Subject patterns for valid leads
 */
export const VALID_SUBJECT_PATTERNS = [
  /^Fiche trio Mutuelle Santé AssurProspect\.fr/i,
  /^LEAD\s*\d*$/i,
] as const;

/**
 * Exclusion patterns (invalid leads)
 */
export const EXCLUSION_PATTERNS = {
  // Empty body
  emptyBody: (text: string) => !text || text.trim().length === 0,

  // Forwarded emails without content
  emptyForward: (subject: string, text: string) =>
    subject.includes('Fwd:') && (!text || text.trim().length === 0),

  // Body too short (minimum valid email is ~500 chars)
  tooShort: (text: string) => text.trim().length < 500,
} as const;

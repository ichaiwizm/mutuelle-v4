/**
 * Detection patterns for lead emails
 */

export type ProviderName = 'AssurProspect' | 'Assurland' | 'Unknown';

/**
 * Patterns to identify valid AssurProspect lead emails (text format)
 */
export const LEAD_PATTERNS = {
  // Core structure markers (must be present)
  transmissionMarker: /Transmission d['']une fiche/i,
  ficheTrioMarker: /fiche trio/i,

  // Required sections (text format)
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
 * Patterns to identify valid AssurProspect lead emails (HTML format)
 * Format: <h2><strong>Section</strong></h2> and <strong>Field :</strong>&nbsp;Value<br>
 */
export const LEAD_HTML_PATTERNS = {
  // Core marker
  transmissionMarker: /Transmission d['']une fiche/i,

  // Required sections (HTML format)
  contactSection: /<h2><strong>Contact<\/strong><\/h2>/i,
  souscripteurSection: /<h2><strong>Souscripteur<\/strong><\/h2>/i,
  besoinSection: /<h2><strong>Besoin<\/strong><\/h2>/i,

  // Required fields (HTML format)
  civilite: /<strong>Civilité\s*:<\/strong>/i,
  nom: /<strong>Nom\s*:<\/strong>/i,
  prenom: /<strong>Prénom\s*:<\/strong>/i,
  telephone: /<strong>Téléphone\s*:<\/strong>/i,
  email: /<strong>Email\s*:<\/strong>/i,
  dateNaissance: /<strong>Date de naissance\s*:<\/strong>/i,
  regimeSocial: /<strong>Régime Social\s*:<\/strong>/i,
  dateEffet: /<strong>Date d['']effet\s*:<\/strong>/i,
} as const;

/**
 * Patterns to identify valid Assurland lead emails (HTML table format)
 * Format: <tr><td><b>Field</b></td><td>Value</td></tr>
 */
export const ASSURLAND_PATTERNS = {
  // Core markers
  htmlTable: /<table[^>]*>.*<\/table>/is,
  assurlandSignature: /assurland\.com/i,
  serviceDataPro: /Service Assurland DataPro/i,

  // Required fields in HTML table format
  civilite: /<td><b>Civilite<\/b><\/td>/i,
  nom: /<td><b>Nom<\/b><\/td>/i,
  prenom: /<td><b>Prenom<\/b><\/td>/i,
  telephone: /<td><b>Telephone portable<\/b><\/td>/i,
  email: /<td><b>Email<\/b><\/td>/i,
  dateNaissance: /<td><b>Date de naissance<\/b><\/td>/i,
  regimeSocial: /<td><b>regime social<\/b><\/td>/i,
} as const;

/**
 * Patterns to identify valid Assurland lead emails (text tab-separated format)
 * Format: Field\tValue
 */
export const ASSURLAND_TEXT_PATTERNS = {
  // Required fields in tab-separated format
  civilite: /^Civilite\t/im,
  nom: /^Nom\t/im,
  prenom: /^Prenom\t/im,
  telephone: /^Telephone portable\t/im,
  email: /^Email\t/im,
  dateNaissance: /^Date de naissance\t/im,
  regimeSocial: /^regime social\t/im,
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

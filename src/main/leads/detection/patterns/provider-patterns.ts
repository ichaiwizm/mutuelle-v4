/**
 * Provider detection patterns
 */

export const PROVIDER_PATTERNS = {
  assurprospect: {
    domain: /assurprospect\.fr/i,
    signature: /L['']equipe AssurProspect/i,
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

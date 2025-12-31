/**
 * AssurProspect lead detection patterns
 */

/** Text format patterns */
export const LEAD_PATTERNS = {
  transmissionMarker: /Transmission d['']une fiche/i,
  ficheTrioMarker: /fiche trio/i,
  contactSection: /\bContact\s*$/m,
  souscripteurSection: /\bSouscripteur\s*$/m,
  besoinSection: /\bBesoin\s*$/m,
  civilite: /Civilite\s*:/i,
  nom: /Nom\s*:/i,
  prenom: /Prenom\s*:/i,
  telephone: /Telephone\s*:/i,
  email: /Email\s*:/i,
  dateNaissance: /Date de naissance\s*:/i,
  regimeSocial: /Regime Social\s*:/i,
  dateEffet: /Date d['']effet\s*:/i,
} as const;

/** HTML format patterns */
export const LEAD_HTML_PATTERNS = {
  transmissionMarker: /Transmission d['']une fiche/i,
  contactSection: /<h2><strong>Contact<\/strong><\/h2>/i,
  souscripteurSection: /<h2><strong>Souscripteur<\/strong><\/h2>/i,
  besoinSection: /<h2><strong>Besoin<\/strong><\/h2>/i,
  civilite: /<strong>Civilite\s*:<\/strong>/i,
  nom: /<strong>Nom\s*:<\/strong>/i,
  prenom: /<strong>Prenom\s*:<\/strong>/i,
  telephone: /<strong>Telephone\s*:<\/strong>/i,
  email: /<strong>Email\s*:<\/strong>/i,
  dateNaissance: /<strong>Date de naissance\s*:<\/strong>/i,
  regimeSocial: /<strong>Regime Social\s*:<\/strong>/i,
  dateEffet: /<strong>Date d['']effet\s*:<\/strong>/i,
} as const;

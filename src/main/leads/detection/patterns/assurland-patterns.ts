/**
 * Assurland lead detection patterns
 */

/** HTML table format patterns */
export const ASSURLAND_PATTERNS = {
  htmlTable: /<table[^>]*>.*<\/table>/is,
  assurlandSignature: /assurland\.com/i,
  serviceDataPro: /Service Assurland DataPro/i,
  civilite: /<td><b>Civilite<\/b><\/td>/i,
  nom: /<td><b>Nom<\/b><\/td>/i,
  prenom: /<td><b>Prenom<\/b><\/td>/i,
  telephone: /<td><b>Telephone portable<\/b><\/td>/i,
  email: /<td><b>Email<\/b><\/td>/i,
  dateNaissance: /<td><b>Date de naissance<\/b><\/td>/i,
  regimeSocial: /<td><b>regime social<\/b><\/td>/i,
} as const;

/** Text tab-separated format patterns */
export const ASSURLAND_TEXT_PATTERNS = {
  civilite: /^Civilite\t/im,
  nom: /^Nom\t/im,
  prenom: /^Prenom\t/im,
  telephone: /^Telephone portable\t/im,
  email: /^Email\t/im,
  dateNaissance: /^Date de naissance\t/im,
  regimeSocial: /^regime social\t/im,
} as const;

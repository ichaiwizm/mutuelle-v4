/**
 * Mapper pour la civilité - Identique à Santé Select
 */

/**
 * Mapping table: AssurProspect → Alptis
 */
const CIVILITE_MAPPING: Record<string, 'monsieur' | 'madame'> = {
  'M.': 'monsieur',
  'Mme': 'madame',
};

/**
 * Map civilité from lead to Alptis format
 */
export function mapCivilite(civilite: string | undefined): 'monsieur' | 'madame' {
  if (!civilite) {
    console.warn('[CIVILITE] Missing civilité, using default: monsieur');
    return 'monsieur';
  }

  const mapped = CIVILITE_MAPPING[civilite];

  if (!mapped) {
    console.warn(`[CIVILITE] Unknown civilité: "${civilite}", using default: monsieur`);
    return 'monsieur';
  }

  return mapped;
}

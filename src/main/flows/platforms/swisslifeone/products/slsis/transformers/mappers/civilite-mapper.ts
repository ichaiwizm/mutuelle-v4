/**
 * Mapper pour la civilité
 * M./Mme → monsieur/madame
 */

const CIVILITE_MAPPING: Record<string, 'monsieur' | 'madame'> = {
  'M.': 'monsieur',
  'M': 'monsieur',
  'Monsieur': 'monsieur',
  'monsieur': 'monsieur',
  'Mme': 'madame',
  'Madame': 'madame',
  'madame': 'madame',
  'Mlle': 'madame',
  'Mademoiselle': 'madame',
};

const DEFAULT_CIVILITE: 'monsieur' | 'madame' = 'monsieur';

/**
 * Mappe la civilité du lead vers le format SwissLifeOne
 * @param civilite - Civilité du lead (M., Mme, etc.)
 * @returns "monsieur" ou "madame"
 */
export function mapCivilite(civilite: string | undefined): 'monsieur' | 'madame' {
  if (!civilite || civilite.trim() === '') {
    console.warn(`[CIVILITE] Missing civilité, using default: ${DEFAULT_CIVILITE}`);
    return DEFAULT_CIVILITE;
  }

  const normalized = civilite.trim();
  const mapped = CIVILITE_MAPPING[normalized];

  if (!mapped) {
    console.warn(`[CIVILITE] Unknown civilité: "${civilite}", using default: ${DEFAULT_CIVILITE}`);
    return DEFAULT_CIVILITE;
  }

  return mapped;
}

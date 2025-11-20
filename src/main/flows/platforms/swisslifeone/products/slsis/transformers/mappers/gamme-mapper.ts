/**
 * Mapper pour les gammes de produits SwissLifeOne
 * 3 gammes disponibles
 */

import type { SwissLifeGamme } from '../types';

/**
 * Mapping des gammes du lead vers les valeurs SwissLifeOne
 */
const GAMME_MAPPING: Record<string, SwissLifeGamme> = {
  // SwissLife Santé (default)
  'swisslife santé': 'SWISSLIFE_SANTE',
  'swisslife sante': 'SWISSLIFE_SANTE',
  'swiss life santé': 'SWISSLIFE_SANTE',
  'swiss life sante': 'SWISSLIFE_SANTE',

  // SwissLife Santé Additionnelle
  'swisslife santé additionnelle': 'SWISSLIFE_SANTE_ADDITIONNELLE',
  'swisslife sante additionnelle': 'SWISSLIFE_SANTE_ADDITIONNELLE',
  'swiss life santé additionnelle': 'SWISSLIFE_SANTE_ADDITIONNELLE',
  'swiss life sante additionnelle': 'SWISSLIFE_SANTE_ADDITIONNELLE',
  'additionnelle': 'SWISSLIFE_SANTE_ADDITIONNELLE',

  // Swiss santé Ma formule hospitalisation
  'swiss santé ma formule hospitalisation': 'SWISS_SANTE_MA_FORMULE_HOSPITALISATION',
  'swiss sante ma formule hospitalisation': 'SWISS_SANTE_MA_FORMULE_HOSPITALISATION',
  'ma formule hospitalisation': 'SWISS_SANTE_MA_FORMULE_HOSPITALISATION',
  'formule hospitalisation': 'SWISS_SANTE_MA_FORMULE_HOSPITALISATION',
  'hospitalisation': 'SWISS_SANTE_MA_FORMULE_HOSPITALISATION',
};

const DEFAULT_GAMME: SwissLifeGamme = 'SWISSLIFE_SANTE';

/**
 * Mappe la gamme du lead vers le format SwissLifeOne
 * Si aucune gamme n'est fournie, utilise le default (SwissLife Santé)
 *
 * @param gamme - Gamme du lead (optionnelle)
 * @returns Gamme SwissLife (3 options)
 */
export function mapGamme(gamme: string | undefined): SwissLifeGamme {
  if (!gamme || gamme.trim() === '') {
    console.log(`[GAMME] No gamme provided, using default: ${DEFAULT_GAMME}`);
    return DEFAULT_GAMME;
  }

  const normalized = gamme.toLowerCase().trim();
  const mapped = GAMME_MAPPING[normalized];

  if (!mapped) {
    console.warn(`[GAMME] Unknown gamme: "${gamme}", using default: ${DEFAULT_GAMME}`);
    return DEFAULT_GAMME;
  }

  return mapped;
}

/**
 * Liste des gammes SwissLifeOne disponibles
 */
export const SWISSLIFE_GAMMES: SwissLifeGamme[] = [
  'SWISSLIFE_SANTE',
  'SWISSLIFE_SANTE_ADDITIONNELLE',
  'SWISS_SANTE_MA_FORMULE_HOSPITALISATION',
];

/**
 * Labels lisibles pour les gammes SwissLifeOne
 */
export const GAMME_LABELS: Record<SwissLifeGamme, string> = {
  SWISSLIFE_SANTE: 'SwissLife Santé',
  SWISSLIFE_SANTE_ADDITIONNELLE: 'SwissLife Santé Additionnelle',
  SWISS_SANTE_MA_FORMULE_HOSPITALISATION: 'Swiss santé, Ma formule hospitalisation',
};

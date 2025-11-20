import type { SwissLifeGamme } from '../../../transformers/types';

/**
 * Maps SwissLifeGamme enum values to the form select option labels
 * These are the visible labels in the gamme/produit dropdown
 */
export function mapGammeToFormLabel(gamme: SwissLifeGamme): string {
  const mapping: Record<SwissLifeGamme, string> = {
    SWISSLIFE_SANTE: 'SwissLife Santé',
    SWISSLIFE_SANTE_ADDITIONNELLE: 'SwissLife Santé Additionnelle',
    SWISS_SANTE_MA_FORMULE_HOSPITALISATION: 'Swiss santé, Ma formule hospitalisation',
  };

  return mapping[gamme];
}

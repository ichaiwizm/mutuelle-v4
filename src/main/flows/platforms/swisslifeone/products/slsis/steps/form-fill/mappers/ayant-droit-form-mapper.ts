import type { AyantDroit } from '../../../transformers/types';

/**
 * Maps AyantDroit enum values to the form select option labels
 * These are the visible labels in the ayant-droit dropdown for children
 */
export function mapAyantDroitToFormLabel(ayantDroit: AyantDroit): string {
  const mapping: Record<AyantDroit, string> = {
    ASSURE_PRINCIPAL: 'Assuré principal',
    CONJOINT: 'Conjoint',
  };

  return mapping[ayantDroit];
}

import type { SwissLifeProfession } from '../../../transformers/types';

/**
 * Maps SwissLifeProfession enum values to the form select option labels
 * These are the visible labels in the profession-assure-principal dropdown
 */
export function mapProfessionToFormLabel(profession: SwissLifeProfession): string {
  const mapping: Record<SwissLifeProfession, string> = {
    MEDECIN: 'Médecin',
    CHIRURGIEN: 'Chirurgien',
    CHIRURGIEN_DENTISTE: 'Chirurgien dentiste',
    PHARMACIEN: 'Pharmacien',
    AUXILIAIRE_MEDICAL: 'Auxiliaire médical',
    NON_MEDICALE: 'Non médicale',
  };

  return mapping[profession];
}

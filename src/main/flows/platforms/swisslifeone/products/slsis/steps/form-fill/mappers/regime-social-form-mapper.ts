import type { SwissLifeRegime } from '../../../transformers/types';

/**
 * Maps SwissLifeRegime enum values to the form select option labels
 * These are the visible labels in the regime-social-assure-principal dropdown
 */
export function mapRegimeSocialToFormLabel(regime: SwissLifeRegime): string {
  const mapping: Record<SwissLifeRegime, string> = {
    REGIME_GENERAL_CPAM: 'Régime Général (CPAM)',
    REGIME_LOCAL_ALSACE_MOSELLE: 'Régime Local (CPAM Alsace Moselle)',
    REGIME_GENERAL_TNS: 'Régime Général pour TNS (CPAM)',
    MSA_AMEXA: 'Mutualité Sociale Agricole (MSA-Amexa)',
    AUTRES_REGIMES_SPECIAUX: 'Autres régimes spéciaux',
  };

  return mapping[regime];
}

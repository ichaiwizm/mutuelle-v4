import type { SwissLifeStatut, SwissLifeRegime } from '../../../transformers/types';

/**
 * Maps SwissLifeStatut enum values to the form select option labels
 *
 * IMPORTANT: The available statut options change dynamically based on the regime_social selected.
 * - For REGIME_GENERAL_TNS: "Travailleur Non Salarié", "Retraité"
 * - For other regimes: "Salarié et autres statuts", "Etudiant", "Travailleur transfrontalier", "Fonctionnaire"
 *
 * @param statut - Internal statut enum value
 * @param regime - The regime_social selected (determines which options are available)
 * @returns The visible label to select in the dropdown
 */
export function mapStatutToFormLabel(statut: SwissLifeStatut, regime: SwissLifeRegime): string {
  // For TNS regime, the dropdown shows different options
  if (regime === 'REGIME_GENERAL_TNS') {
    const tnsMapping: Record<SwissLifeStatut, string> = {
      SALARIE: 'Travailleur Non Salarié',  // SALARIE maps to TNS option for TNS regime
      ETUDIANT: 'Etudiant',                 // Fallback (may not exist in TNS dropdown)
      TRANSFRONTALIER: 'Travailleur transfrontalier',  // Fallback
      FONCTIONNAIRE: 'Fonctionnaire',       // Fallback
    };
    return tnsMapping[statut];
  }

  // For all other regimes (CPAM, Alsace-Moselle, MSA, etc.), use standard mapping
  const standardMapping: Record<SwissLifeStatut, string> = {
    SALARIE: 'Salarié et autres statuts',
    ETUDIANT: 'Etudiant',
    TRANSFRONTALIER: 'Travailleur transfrontalier',
    FONCTIONNAIRE: 'Fonctionnaire',
  };

  return standardMapping[statut];
}

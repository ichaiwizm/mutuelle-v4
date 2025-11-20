/**
 * Mapper pour les régimes sociaux SwissLifeOne
 * 5 régimes sociaux
 */

import type { SwissLifeRegime } from '../types';

/**
 * Mapping des régimes sociaux du lead vers les valeurs SwissLifeOne
 */
const REGIME_MAPPING: Record<string, SwissLifeRegime> = {
  // Régime Général (CPAM) - Default
  'régime général': 'REGIME_GENERAL_CPAM',
  'regime general': 'REGIME_GENERAL_CPAM',
  'cpam': 'REGIME_GENERAL_CPAM',
  'sécurité sociale': 'REGIME_GENERAL_CPAM',
  'securite sociale': 'REGIME_GENERAL_CPAM',
  'régime général (cpam)': 'REGIME_GENERAL_CPAM',
  'regime general (cpam)': 'REGIME_GENERAL_CPAM',
  'salarié': 'REGIME_GENERAL_CPAM',
  'salarie': 'REGIME_GENERAL_CPAM',
  'salarié (ou retraité)': 'REGIME_GENERAL_CPAM',
  'salarie (ou retraite)': 'REGIME_GENERAL_CPAM',

  // Régime Local Alsace Moselle
  'régime local': 'REGIME_LOCAL_ALSACE_MOSELLE',
  'regime local': 'REGIME_LOCAL_ALSACE_MOSELLE',
  'alsace': 'REGIME_LOCAL_ALSACE_MOSELLE',
  'moselle': 'REGIME_LOCAL_ALSACE_MOSELLE',
  'alsace moselle': 'REGIME_LOCAL_ALSACE_MOSELLE',
  'alsace-moselle': 'REGIME_LOCAL_ALSACE_MOSELLE',
  'régime local (cpam alsace moselle)': 'REGIME_LOCAL_ALSACE_MOSELLE',
  'regime local (cpam alsace moselle)': 'REGIME_LOCAL_ALSACE_MOSELLE',

  // Régime Général pour TNS
  'tns': 'REGIME_GENERAL_TNS',
  'travailleur non salarié': 'REGIME_GENERAL_TNS',
  'travailleur non salarie': 'REGIME_GENERAL_TNS',
  'indépendant': 'REGIME_GENERAL_TNS',
  'independant': 'REGIME_GENERAL_TNS',
  'tns : régime des indépendants': 'REGIME_GENERAL_TNS',
  'tns : regime des independants': 'REGIME_GENERAL_TNS',
  'régime général pour tns': 'REGIME_GENERAL_TNS',
  'regime general pour tns': 'REGIME_GENERAL_TNS',
  'régime général pour tns (cpam)': 'REGIME_GENERAL_TNS',
  'regime general pour tns (cpam)': 'REGIME_GENERAL_TNS',

  // MSA-Amexa
  'msa': 'MSA_AMEXA',
  'amexa': 'MSA_AMEXA',
  'mutualité sociale agricole': 'MSA_AMEXA',
  'mutualite sociale agricole': 'MSA_AMEXA',
  'msa-amexa': 'MSA_AMEXA',
  'mutualité sociale agricole (msa-amexa)': 'MSA_AMEXA',
  'mutualite sociale agricole (msa-amexa)': 'MSA_AMEXA',
  'agricole': 'MSA_AMEXA',
  'exploitant agricole': 'MSA_AMEXA',
  'salarié exploitant agricole': 'MSA_AMEXA',
  'salarie exploitant agricole': 'MSA_AMEXA',
  'régime salariés agricoles': 'MSA_AMEXA',
  'regime salaries agricoles': 'MSA_AMEXA',

  // Autres régimes spéciaux
  'autres régimes spéciaux': 'AUTRES_REGIMES_SPECIAUX',
  'autres regimes speciaux': 'AUTRES_REGIMES_SPECIAUX',
  'régime spécial': 'AUTRES_REGIMES_SPECIAUX',
  'regime special': 'AUTRES_REGIMES_SPECIAUX',
  'autre': 'AUTRES_REGIMES_SPECIAUX',
};

const DEFAULT_REGIME: SwissLifeRegime = 'REGIME_GENERAL_CPAM';

/**
 * Mappe le régime social du lead vers le format SwissLifeOne
 * @param regimeSocial - Régime social du lead
 * @returns Régime SwissLife (5 options)
 */
export function mapRegimeSocial(regimeSocial: string | undefined): SwissLifeRegime {
  if (!regimeSocial || regimeSocial.trim() === '') {
    console.warn(`[REGIME] Missing regime social, using default: ${DEFAULT_REGIME}`);
    return DEFAULT_REGIME;
  }

  const normalized = regimeSocial.toLowerCase().trim();
  const mapped = REGIME_MAPPING[normalized];

  if (!mapped) {
    console.warn(
      `[REGIME] Unknown regime social: "${regimeSocial}", using default: ${DEFAULT_REGIME}`
    );
    return DEFAULT_REGIME;
  }

  return mapped;
}

/**
 * Liste des régimes sociaux SwissLifeOne disponibles
 */
export const SWISSLIFE_REGIMES: SwissLifeRegime[] = [
  'REGIME_GENERAL_CPAM',
  'REGIME_LOCAL_ALSACE_MOSELLE',
  'REGIME_GENERAL_TNS',
  'MSA_AMEXA',
  'AUTRES_REGIMES_SPECIAUX',
];

/**
 * Labels lisibles pour les régimes SwissLifeOne
 */
export const REGIME_LABELS: Record<SwissLifeRegime, string> = {
  REGIME_GENERAL_CPAM: 'Régime Général (CPAM)',
  REGIME_LOCAL_ALSACE_MOSELLE: 'Régime Local (CPAM Alsace Moselle)',
  REGIME_GENERAL_TNS: 'Régime Général pour TNS (CPAM)',
  MSA_AMEXA: 'Mutualité Sociale Agricole (MSA-Amexa)',
  AUTRES_REGIMES_SPECIAUX: 'Autres régimes spéciaux',
};

/**
 * Vérifie si un régime est de type TNS (pour Loi Madelin)
 * @param regime - Régime SwissLife
 * @returns true si TNS
 */
export function isTNSRegime(regime: SwissLifeRegime): boolean {
  return regime === 'REGIME_GENERAL_TNS';
}

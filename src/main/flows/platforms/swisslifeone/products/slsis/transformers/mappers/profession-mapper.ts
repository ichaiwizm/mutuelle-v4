/**
 * Mapper pour les professions SwissLifeOne
 * 6 professions (focus médical)
 */

import type { SwissLifeProfession } from '../types';

/**
 * Mapping des professions du lead vers les valeurs SwissLifeOne
 */
const PROFESSION_MAPPING: Record<string, SwissLifeProfession> = {
  // Médecin
  'médecin': 'MEDECIN',
  'medecin': 'MEDECIN',
  'docteur': 'MEDECIN',
  'médecin généraliste': 'MEDECIN',
  'médecin spécialiste': 'MEDECIN',

  // Chirurgien
  'chirurgien': 'CHIRURGIEN',

  // Chirurgien dentiste
  'chirurgien dentiste': 'CHIRURGIEN_DENTISTE',
  'dentiste': 'CHIRURGIEN_DENTISTE',
  'chirurgien-dentiste': 'CHIRURGIEN_DENTISTE',

  // Pharmacien
  'pharmacien': 'PHARMACIEN',
  'pharmacienne': 'PHARMACIEN',

  // Auxiliaire médical
  'auxiliaire médical': 'AUXILIAIRE_MEDICAL',
  'auxiliaire medical': 'AUXILIAIRE_MEDICAL',
  'infirmier': 'AUXILIAIRE_MEDICAL',
  'infirmière': 'AUXILIAIRE_MEDICAL',
  'aide-soignant': 'AUXILIAIRE_MEDICAL',
  'aide soignant': 'AUXILIAIRE_MEDICAL',
  'kinésithérapeute': 'AUXILIAIRE_MEDICAL',
  'kiné': 'AUXILIAIRE_MEDICAL',
  'sage-femme': 'AUXILIAIRE_MEDICAL',

  // Non médicale (tous les autres)
  'non médicale': 'NON_MEDICALE',
  'non medicale': 'NON_MEDICALE',
  'salarié': 'NON_MEDICALE',
  'salarie': 'NON_MEDICALE',
  'commerçant': 'NON_MEDICALE',
  'commercant': 'NON_MEDICALE',
  'artisan': 'NON_MEDICALE',
  "chef d'entreprise": 'NON_MEDICALE',
  'chef entreprise': 'NON_MEDICALE',
  'profession libérale': 'NON_MEDICALE',
  'profession liberale': 'NON_MEDICALE',
  'retraité': 'NON_MEDICALE',
  'retraite': 'NON_MEDICALE',
  'sans activité': 'NON_MEDICALE',
  'sans activite': 'NON_MEDICALE',
  'étudiant': 'NON_MEDICALE',
  'etudiant': 'NON_MEDICALE',

  // Agricole
  'exploitant agricole': 'NON_MEDICALE',
  'agriculteur': 'NON_MEDICALE',
  'agricultrice': 'NON_MEDICALE',
  'éleveur': 'NON_MEDICALE',
  'eleveur': 'NON_MEDICALE',

  // Sans emploi
  'en recherche d\'emploi': 'NON_MEDICALE',
  'en recherche d emploi': 'NON_MEDICALE',
  'demandeur d\'emploi': 'NON_MEDICALE',
  'demandeur d emploi': 'NON_MEDICALE',
  'sans emploi': 'NON_MEDICALE',
  'chômeur': 'NON_MEDICALE',
  'chomeur': 'NON_MEDICALE',
  'chômeuse': 'NON_MEDICALE',
  'chomeuse': 'NON_MEDICALE',

  // TNS / Indépendant
  'tns': 'NON_MEDICALE',
  'travailleur non salarié': 'NON_MEDICALE',
  'travailleur non salarie': 'NON_MEDICALE',
  'indépendant': 'NON_MEDICALE',
  'independant': 'NON_MEDICALE',
  'travailleur indépendant': 'NON_MEDICALE',
  'travailleur independant': 'NON_MEDICALE',

  // Fonctionnaire
  'fonctionnaire': 'NON_MEDICALE',
  'agent public': 'NON_MEDICALE',
  'fonction publique': 'NON_MEDICALE',
};

const DEFAULT_PROFESSION: SwissLifeProfession = 'NON_MEDICALE';

/**
 * Mappe la profession du lead vers le format SwissLifeOne
 * @param profession - Profession du lead
 * @returns Profession SwissLife (6 options)
 */
export function mapProfession(profession: string | undefined): SwissLifeProfession {
  if (!profession || profession.trim() === '') {
    console.warn(`[PROFESSION] Missing profession, using default: ${DEFAULT_PROFESSION}`);
    return DEFAULT_PROFESSION;
  }

  const normalized = profession.toLowerCase().trim();
  const mapped = PROFESSION_MAPPING[normalized];

  if (!mapped) {
    console.warn(
      `[PROFESSION] Unknown profession: "${profession}", using default: ${DEFAULT_PROFESSION}`
    );
    return DEFAULT_PROFESSION;
  }

  return mapped;
}

/**
 * Liste des professions SwissLifeOne disponibles
 */
export const SWISSLIFE_PROFESSIONS: SwissLifeProfession[] = [
  'MEDECIN',
  'CHIRURGIEN',
  'CHIRURGIEN_DENTISTE',
  'PHARMACIEN',
  'AUXILIAIRE_MEDICAL',
  'NON_MEDICALE',
];

/**
 * Labels lisibles pour les professions SwissLifeOne
 */
export const PROFESSION_LABELS: Record<SwissLifeProfession, string> = {
  MEDECIN: 'Médecin',
  CHIRURGIEN: 'Chirurgien',
  CHIRURGIEN_DENTISTE: 'Chirurgien dentiste',
  PHARMACIEN: 'Pharmacien',
  AUXILIAIRE_MEDICAL: 'Auxiliaire médical',
  NON_MEDICALE: 'Non médicale',
};

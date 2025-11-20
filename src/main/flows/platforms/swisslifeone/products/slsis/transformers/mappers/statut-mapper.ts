/**
 * Mapper pour le statut professionnel SwissLifeOne
 * 4 statuts
 */

import type { SwissLifeStatut } from '../types';

/**
 * Mapping des statuts du lead vers les valeurs SwissLifeOne
 */
const STATUT_MAPPING: Record<string, SwissLifeStatut> = {
  // Salarié (default et plus commun)
  'salarié': 'SALARIE',
  'salarie': 'SALARIE',
  'salarié et autres statuts': 'SALARIE',
  'salarie et autres statuts': 'SALARIE',
  'employé': 'SALARIE',
  'employe': 'SALARIE',
  'cadre': 'SALARIE',
  'agent de maîtrise': 'SALARIE',
  'agent de maitrise': 'SALARIE',
  'ouvrier': 'SALARIE',

  // Etudiant
  'étudiant': 'ETUDIANT',
  'etudiant': 'ETUDIANT',
  'élève': 'ETUDIANT',
  'eleve': 'ETUDIANT',

  // Travailleur transfrontalier
  'travailleur transfrontalier': 'TRANSFRONTALIER',
  'transfrontalier': 'TRANSFRONTALIER',
  'frontalier': 'TRANSFRONTALIER',

  // Fonctionnaire
  'fonctionnaire': 'FONCTIONNAIRE',
  'fonction publique': 'FONCTIONNAIRE',
  'agent public': 'FONCTIONNAIRE',
};

const DEFAULT_STATUT: SwissLifeStatut = 'SALARIE';

/**
 * Mappe le statut du lead vers le format SwissLifeOne
 * @param statut - Statut professionnel du lead
 * @returns Statut SwissLife (4 options)
 */
export function mapStatut(statut: string | undefined): SwissLifeStatut {
  if (!statut || statut.trim() === '') {
    console.warn(`[STATUT] Missing statut, using default: ${DEFAULT_STATUT}`);
    return DEFAULT_STATUT;
  }

  const normalized = statut.toLowerCase().trim();
  const mapped = STATUT_MAPPING[normalized];

  if (!mapped) {
    console.warn(`[STATUT] Unknown statut: "${statut}", using default: ${DEFAULT_STATUT}`);
    return DEFAULT_STATUT;
  }

  return mapped;
}

/**
 * Liste des statuts SwissLifeOne disponibles
 */
export const SWISSLIFE_STATUTS: SwissLifeStatut[] = [
  'SALARIE',
  'ETUDIANT',
  'TRANSFRONTALIER',
  'FONCTIONNAIRE',
];

/**
 * Labels lisibles pour les statuts SwissLifeOne
 */
export const STATUT_LABELS: Record<SwissLifeStatut, string> = {
  SALARIE: 'Salarié et autres statuts',
  ETUDIANT: 'Etudiant',
  TRANSFRONTALIER: 'Travailleur transfrontalier',
  FONCTIONNAIRE: 'Fonctionnaire',
};

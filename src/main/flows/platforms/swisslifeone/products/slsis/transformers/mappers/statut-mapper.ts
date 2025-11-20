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
 * Infère le statut professionnel depuis la profession et le régime social
 * Utilisé quand le statut n'est pas fourni explicitement dans les données source
 *
 * @param statutFourni - Statut fourni (peut être undefined)
 * @param profession - Profession du lead
 * @param regimeSocial - Régime social du lead
 * @returns Statut SwissLife inféré ou par défaut
 */
export function inferStatut(
  statutFourni: string | undefined,
  profession?: string,
  regimeSocial?: string
): SwissLifeStatut {
  // Si statut fourni et valide, l'utiliser en priorité
  if (statutFourni) {
    const mapped = mapStatut(statutFourni);
    // Si le mapping a réussi (pas de warning), retourner la valeur
    if (mapped !== DEFAULT_STATUT || STATUT_MAPPING[statutFourni.toLowerCase().trim()]) {
      return mapped;
    }
  }

  // Sinon, inférer depuis profession et régime social
  const p = profession?.toLowerCase().trim() || '';
  const r = regimeSocial?.toLowerCase().trim() || '';

  // ETUDIANT: profession contient "étudiant" ou "élève"
  if (p.includes('étudiant') || p.includes('etudiant') || p.includes('élève') || p.includes('eleve')) {
    console.log(`[STATUT] Inferred ETUDIANT from profession: "${profession}"`);
    return 'ETUDIANT';
  }

  // FONCTIONNAIRE: profession ou régime contient "fonctionnaire" ou "fonction publique"
  if (
    p.includes('fonctionnaire') ||
    p.includes('fonction publique') ||
    p.includes('agent public') ||
    r.includes('fonctionnaire') ||
    r.includes('fonction publique')
  ) {
    console.log(
      `[STATUT] Inferred FONCTIONNAIRE from profession: "${profession}" or regime: "${regimeSocial}"`
    );
    return 'FONCTIONNAIRE';
  }

  // TRANSFRONTALIER: régime contient "frontalier" ou "suisse"
  if (r.includes('frontalier') || r.includes('suisse') || p.includes('frontalier')) {
    console.log(`[STATUT] Inferred TRANSFRONTALIER from regime: "${regimeSocial}"`);
    return 'TRANSFRONTALIER';
  }

  // SALARIE par défaut (couvre salariés, retraités, TNS, artisans, commerçants, etc.)
  if (!statutFourni) {
    console.log(`[STATUT] No statut provided, using default: ${DEFAULT_STATUT}`);
  }

  return DEFAULT_STATUT;
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

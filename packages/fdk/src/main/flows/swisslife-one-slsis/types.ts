/**
 * Types and enums for SwissLife One SLSIS flow
 */

/** SwissLife profession values */
export enum SwissLifeProfession {
  SALARIE = 'salarie',
  TNS = 'tns',
  SANS_EMPLOI = 'sans_emploi',
  RETRAITE = 'retraite',
  ETUDIANT = 'etudiant',
}

/** SwissLife regime values */
export enum SwissLifeRegime {
  GENERAL = 'regime_general',
  ALSACE_MOSELLE = 'alsace_moselle',
  TNS = 'tns',
}

/** SwissLife statut professionnel values */
export enum SwissLifeStatut {
  CADRE = 'cadre',
  NON_CADRE = 'non_cadre',
  TNS_COMMERCANT = 'tns_commercant',
  TNS_ARTISAN = 'tns_artisan',
  TNS_LIBERAL = 'tns_liberal',
}

/** SwissLife gamme values */
export enum SwissLifeGamme {
  ESSENTIEL = 'essentiel',
  CONFORT = 'confort',
  EQUILIBRE = 'equilibre',
  EXCELLENCE = 'excellence',
}

/** Type de simulation based on family structure */
export enum TypeSimulation {
  ASSURE_SEUL = 'assure_seul',
  ASSURE_CONJOINT = 'assure_conjoint',
  ASSURE_ENFANTS = 'assure_enfants',
  FAMILLE = 'famille',
}

/** Couverture besoins type */
export type CouvertureType = 'oui' | 'non';

/** Enfant data structure */
export interface EnfantData {
  dateNaissance: string;
  regime: SwissLifeRegime;
}

/** Conjoint data structure */
export interface ConjointData {
  dateNaissance: string;
  profession: SwissLifeProfession;
  regime: SwissLifeRegime;
  statut?: SwissLifeStatut;
}

/** Assure principal data structure */
export interface AssurePrincipalData {
  dateNaissance: string;
  profession: SwissLifeProfession;
  regime: SwissLifeRegime;
  statut?: SwissLifeStatut;
  codePostal: string;
}

/** Main form data interface for SwissLife One SLSIS */
export interface SwissLifeOneFormData {
  // Section 1: Projet
  nomProjet: string;

  // Section 2: Besoins
  couvertureSoins: CouvertureType;
  indemniteHospitalisation: CouvertureType;
  indemniteMaladieGrave: CouvertureType;

  // Section 3: Type simulation
  typeSimulation: TypeSimulation;

  // Section 4: Assure principal
  assurePrincipal: AssurePrincipalData;

  // Section 5: Conjoint (optional)
  conjoint?: ConjointData;

  // Section 6: Enfants (optional, dynamic)
  enfants?: EnfantData[];

  // Section 7: Gammes et options
  gamme: SwissLifeGamme;
  madelin: boolean;
  repriseContrat: boolean;
  resiliation: boolean;
  dateEffet: string;
}

/**
 * Types and enums for Alptis Sante Pro Plus flow
 */

/** Statut professionnel for TNS */
export type StatutProfessionnel = 'ARTISAN_COMMERCANT' | 'PROFESSIONS_LIBERALES';

/** Regime social */
export type RegimeSocial = 'TNS' | 'SALARIE' | 'AUTRE';

/** Profession categories */
export type ProfessionCategory =
  | 'ARTISAN'
  | 'COMMERCANT'
  | 'PROFESSION_LIBERALE'
  | 'AGRICULTEUR';

/** Civilite */
export type Civilite = 'M' | 'MME';

/** Form data for adherent */
export interface AdherentFormData {
  civilite: Civilite;
  nom: string;
  prenom: string;
  dateNaissance: string;
  email: string;
  telephone: string;
  adresse: {
    rue: string;
    codePostal: string;
    ville: string;
  };
  profession: string;
  regime: RegimeSocial;
  statut_professionnel: StatutProfessionnel;
  micro_entrepreneur: boolean;
}

/** Form data for conjoint (simplified - no cadre_exercice) */
export interface ConjointFormData {
  civilite: Civilite;
  nom: string;
  prenom: string;
  dateNaissance: string;
  regime: RegimeSocial;
}

/** Form data for child */
export interface EnfantFormData {
  nom: string;
  prenom: string;
  dateNaissance: string;
  rang: number;
}

/** Complete Sante Pro Plus form data */
export interface SanteProPlusFormData {
  adherent: AdherentFormData;
  conjoint?: ConjointFormData;
  enfants: EnfantFormData[];
  dateEffet: string;
  formule: string;
}

/** Lead input data */
export interface SanteProPlusLeadData {
  adherent: Partial<AdherentFormData>;
  conjoint?: Partial<ConjointFormData>;
  enfants?: Partial<EnfantFormData>[];
  dateEffet?: string;
  formule?: string;
}

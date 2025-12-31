/**
 * Types for Entoria Pack Famille flow
 */

/** Formule options for Entoria Pack Famille */
export type FormuleType =
  | 'HOSPI_PLUS_PRO'
  | 'ECO_PRO'
  | 'ESSENTIEL_PRO'
  | 'SECURITE_PRO'
  | 'CONFORT_PRO'
  | 'EXCELLENCE_PRO';

/** Frequence de reglement */
export type FrequenceType = 'Mensuelle' | 'Trimestrielle';

/** Step 1: Profil data */
export interface ProfilData {
  date_naissance: string;
  profession: string;
  exerce_en_tant_que: string;
  departement_residence: string;
  assure_prevoyance_entoria: boolean;
}

/** Step 2: Besoin data */
export interface BesoinData {
  hospitalisation_uniquement: boolean;
}

/** Step 3: Garanties data */
export interface GarantiesData {
  frequence_reglement: FrequenceType;
  date_effet: string;
  avec_conjoint: boolean;
  avec_enfants: boolean;
  formule_choisie: FormuleType;
}

/** Complete form data */
export interface PackFamilleFormData {
  profil: ProfilData;
  besoin: BesoinData;
  garanties: GarantiesData;
}

/** Transform result */
export interface TransformResult {
  success: boolean;
  data?: PackFamilleFormData;
  errors?: TransformError[];
  warnings?: TransformWarning[];
}

/** Transform error */
export interface TransformError {
  code: string;
  message: string;
  field?: string;
  severity: 'critical' | 'medium' | 'low';
}

/** Transform warning */
export interface TransformWarning {
  code: string;
  message: string;
  field?: string;
  action: string;
}

/** Default values */
export const DEFAULTS = {
  hospitalisation_uniquement: false,
  frequence_reglement: 'Mensuelle' as FrequenceType,
  formule_choisie: 'ESSENTIEL_PRO' as FormuleType,
  assure_prevoyance_entoria: false,
  exerce_en_tant_que: 'GERANT MAJORITAIRE',
  departement_residence: '75',
} as const;

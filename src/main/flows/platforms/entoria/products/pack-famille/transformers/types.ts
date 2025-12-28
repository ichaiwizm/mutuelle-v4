/**
 * Types pour le formulaire Entoria Pack Famille (TNS Santé)
 * Formulaire de tarification en 4 étapes
 */

import type { Lead } from '@/shared/types/lead';

/**
 * Étape 1 : Profil de l'entrepreneur
 */
export interface PackFamilleProfilData {
  date_naissance: string; // DD/MM/YYYY
  profession: string; // Autocomplete value
  exerce_en_tant_que: string; // Conditionnel après profession
  departement_residence: string; // Code département (ex: "75")
  assure_prevoyance_entoria: boolean;
}

/**
 * Étape 2 : Recueil des besoins
 */
export interface PackFamilleBesoinData {
  hospitalisation_uniquement: boolean;
}

/**
 * Étape 3 : Choix des garanties
 */
export interface PackFamilleGarantiesData {
  frequence_reglement: 'Mensuelle' | 'Trimestrielle';
  date_effet: string; // DD/MM/YYYY
  avec_conjoint: boolean;
  avec_enfants: boolean;
  formule_choisie?: 'HOSPI_PLUS_PRO' | 'ECO_PRO' | 'ESSENTIEL_PRO' | 'SECURITE_PRO' | 'CONFORT_PRO' | 'EXCELLENCE_PRO';
}

/**
 * Données complètes du formulaire
 */
export interface PackFamilleFormData {
  profil: PackFamilleProfilData;
  besoin: PackFamilleBesoinData;
  garanties: PackFamilleGarantiesData;
}

/**
 * Résultat de transformation
 */
export type TransformResult = {
  success: boolean;
  data?: PackFamilleFormData;
  errors?: TransformError[];
  warnings?: TransformWarning[];
};

/**
 * Erreur de transformation
 */
export type TransformError = {
  code: string;
  message: string;
  field?: string;
  severity: 'critical' | 'medium' | 'low';
};

/**
 * Warning de transformation
 */
export type TransformWarning = {
  code: string;
  message: string;
  field?: string;
  action: string;
};

/**
 * Export du type Lead
 */
export type { Lead };

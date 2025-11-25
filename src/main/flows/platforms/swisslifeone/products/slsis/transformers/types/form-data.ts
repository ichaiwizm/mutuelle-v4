/**
 * SwissLifeOne SLSIS Form Data Types
 * Type definitions for form data structures
 */

import type {
  SwissLifeProfession,
  SwissLifeRegime,
  SwissLifeStatut,
  SwissLifeGamme,
  TypeSimulation,
  AyantDroit,
} from './enums';

/**
 * Structure complete des donnees transformees pour SwissLifeOne Step 1
 */
export type SwissLifeOneFormData = {
  projet: ProjetData;
  besoins: BesoinsData;
  type_simulation: TypeSimulation;
  assure_principal: AssurePrincipalData;
  conjoint?: ConjointData;
  enfants?: EnfantsData;
  gammes_options: GammesOptionsData;
};

/**
 * Informations du projet (auto-generees)
 */
export type ProjetData = {
  nom_projet: string; // Format: "Projet {nom} {prenom} {YYYYMMDD}"
};

/**
 * Besoins (defaults)
 */
export type BesoinsData = {
  besoin_couverture_individuelle: boolean; // Default: true
  besoin_indemnites_journalieres: boolean; // Default: false
};

/**
 * Donnees de l'assure principal
 */
export type AssurePrincipalData = {
  date_naissance: string; // Format: DD/MM/YYYY
  departement_residence: string; // Format: "01"-"95", "2A", "2B", "97"
  regime_social: SwissLifeRegime;
  profession: SwissLifeProfession;
  statut: SwissLifeStatut;
};

/**
 * Donnees du conjoint (optionnel)
 */
export type ConjointData = {
  date_naissance: string; // Format: DD/MM/YYYY
  regime_social: SwissLifeRegime;
  profession: SwissLifeProfession;
  statut: SwissLifeStatut;
};

/**
 * Donnees des enfants (optionnel)
 */
export type EnfantsData = {
  nombre_enfants: number; // 0-10
  liste: Array<EnfantData>;
};

/**
 * Donnees d'un enfant
 */
export type EnfantData = {
  date_naissance: string; // Format: DD/MM/YYYY
  ayant_droit: AyantDroit; // Determine le regime herite
};

/**
 * Gammes et options
 */
export type GammesOptionsData = {
  gamme: SwissLifeGamme; // Default: SWISSLIFE_SANTE
  date_effet: string; // Format: DD/MM/YYYY, min 5 jours dans le futur
  loi_madelin: boolean; // true si regime = TNS
  reprise_iso_garanties: boolean; // Default: true
  resiliation_a_effectuer: boolean; // Default: false
};

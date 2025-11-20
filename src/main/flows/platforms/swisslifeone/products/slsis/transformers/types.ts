/**
 * SwissLifeOne SLSIS Transformer Types
 * Type definitions for transforming Lead data to SwissLifeOne form format (Step 1 only)
 */

import type { Lead } from '@/shared/types/lead';

// ============================================================================
// ENUMS - SwissLifeOne Specific Values
// ============================================================================

/**
 * SwissLifeOne Professions (6 options - focus médical)
 */
export type SwissLifeProfession =
  | 'MEDECIN'
  | 'CHIRURGIEN'
  | 'CHIRURGIEN_DENTISTE'
  | 'PHARMACIEN'
  | 'AUXILIAIRE_MEDICAL'
  | 'NON_MEDICALE';

/**
 * SwissLifeOne Régimes Sociaux (5 options)
 */
export type SwissLifeRegime =
  | 'REGIME_GENERAL_CPAM'
  | 'REGIME_LOCAL_ALSACE_MOSELLE'
  | 'REGIME_GENERAL_TNS'
  | 'MSA_AMEXA'
  | 'AUTRES_REGIMES_SPECIAUX';

/**
 * SwissLifeOne Statuts Professionnels (4 options)
 */
export type SwissLifeStatut =
  | 'SALARIE'
  | 'ETUDIANT'
  | 'TRANSFRONTALIER'
  | 'FONCTIONNAIRE';

/**
 * SwissLifeOne Gammes de Produits (3 options)
 */
export type SwissLifeGamme =
  | 'SWISSLIFE_SANTE'
  | 'SWISSLIFE_SANTE_ADDITIONNELLE'
  | 'SWISS_SANTE_MA_FORMULE_HOSPITALISATION';

/**
 * Type de simulation
 */
export type TypeSimulation = 'INDIVIDUEL' | 'POUR_LE_COUPLE';

/**
 * Ayant droit pour les enfants
 */
export type AyantDroit = 'ASSURE_PRINCIPAL' | 'CONJOINT';

// ============================================================================
// OUTPUT DATA STRUCTURES - SwissLifeOne Form Data
// ============================================================================

/**
 * Structure complète des données transformées pour SwissLifeOne Step 1
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
 * Informations du projet (auto-générées)
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
 * Données de l'assuré principal
 */
export type AssurePrincipalData = {
  date_naissance: string; // Format: DD/MM/YYYY
  departement_residence: string; // Format: "01"-"95", "2A", "2B", "97"
  regime_social: SwissLifeRegime;
  profession: SwissLifeProfession;
  statut: SwissLifeStatut;
};

/**
 * Données du conjoint (optionnel)
 */
export type ConjointData = {
  date_naissance: string; // Format: DD/MM/YYYY
  regime_social: SwissLifeRegime;
  profession: SwissLifeProfession;
  statut: SwissLifeStatut;
};

/**
 * Données des enfants (optionnel)
 */
export type EnfantsData = {
  nombre_enfants: number; // 0-10
  liste: Array<EnfantData>;
};

/**
 * Données d'un enfant
 */
export type EnfantData = {
  date_naissance: string; // Format: DD/MM/YYYY
  ayant_droit: AyantDroit; // Détermine le régime hérité
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

// ============================================================================
// TRANSFORMATION RESULT TYPES
// ============================================================================

/**
 * Résultat de transformation avec gestion d'erreurs
 */
export type TransformResult = {
  success: boolean;
  data?: SwissLifeOneFormData;
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
};

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Résultat de validation
 */
export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

/**
 * Résultat de validation de compatibilité
 */
export type CompatibilityResult = {
  compatible: boolean;
  reason?: string;
};

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Mapping de départements français
 */
export type DepartementCode =
  | '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10'
  | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '2A'
  | '2B' | '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29'
  | '30' | '31' | '32' | '33' | '34' | '35' | '36' | '37' | '38' | '39'
  | '40' | '41' | '42' | '43' | '44' | '45' | '46' | '47' | '48' | '49'
  | '50' | '51' | '52' | '53' | '54' | '55' | '56' | '57' | '58' | '59'
  | '60' | '61' | '62' | '63' | '64' | '65' | '66' | '67' | '68' | '69'
  | '70' | '71' | '72' | '73' | '74' | '75' | '76' | '77' | '78' | '79'
  | '80' | '81' | '82' | '83' | '84' | '85' | '86' | '87' | '88' | '89'
  | '90' | '91' | '92' | '93' | '94' | '95' | '97';

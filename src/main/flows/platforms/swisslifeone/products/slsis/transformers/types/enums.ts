/**
 * SwissLifeOne SLSIS Enums
 * Type definitions for SwissLifeOne specific values
 */

/**
 * SwissLifeOne Professions (6 options - focus medical)
 */
export type SwissLifeProfession =
  | 'MEDECIN'
  | 'CHIRURGIEN'
  | 'CHIRURGIEN_DENTISTE'
  | 'PHARMACIEN'
  | 'AUXILIAIRE_MEDICAL'
  | 'NON_MEDICALE';

/**
 * SwissLifeOne Regimes Sociaux (5 options)
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

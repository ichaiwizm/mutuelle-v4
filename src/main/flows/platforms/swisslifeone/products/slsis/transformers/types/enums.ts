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

/**
 * Codes département français (01-95, 2A, 2B, 97)
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

/**
 * Generic and platform-specific profession constants
 */

/** Generic profession values (used as common input keys) */
export const GENERIC_PROFESSIONS = {
  ARTISAN: 'artisan',
  COMMERCANT: 'commercant',
  LIBERAL: 'profession liberale',
  AGRICULTEUR: 'agriculteur',
  SALARIE: 'salarie',
  RETRAITE: 'retraite',
  CADRE: 'cadre',
  OUVRIER: 'ouvrier',
  SANS_ACTIVITE: 'sans activite',
  CHEF_ENTREPRISE: "chef d'entreprise",
  FONCTION_PUBLIQUE: 'fonction publique',
} as const;

/** Alptis profession output values */
export const ALPTIS_PROFESSIONS = {
  AGRICULTEURS_EXPLOITANTS: 'AGRICULTEURS_EXPLOITANTS',
  ARTISANS: 'ARTISANS',
  CADRES: 'CADRES',
  CADRES_FONCTION_PUBLIQUE: 'CADRES_ET_EMPLOYES_DE_LA_FONCTION_PUBLIQUE',
  CHEFS_ENTREPRISE: 'CHEFS_D_ENTREPRISE',
  COMMERCANTS: 'COMMERCANTS_ET_ASSIMILES',
  EMPLOYES: 'EMPLOYES_AGENTS_DE_MAITRISE',
  OUVRIERS: 'OUVRIERS',
  SANS_ACTIVITE: 'PERSONNES_SANS_ACTIVITE_PROFESSIONNELLE',
  LIBERALES: 'PROFESSIONS_LIBERALES_ET_ASSIMILES',
  RETRAITES: 'RETRAITES',
} as const;

/** SwissLife profession output values */
export const SWISSLIFE_PROFESSIONS = {
  SALARIE: 'salarie',
  TNS: 'tns',
  SANS_EMPLOI: 'sans_emploi',
  RETRAITE: 'retraite',
  ETUDIANT: 'etudiant',
} as const;

/** Entoria default profession */
export const ENTORIA_DEFAULT_PROFESSION = "GERANT, CHEF D'ENTREPRISE DE SERVICES";

/** Common professions for Entoria dropdown */
export const ENTORIA_COMMON_PROFESSIONS = [
  'COMMERCANT',
  'ARTISAN DES METIERS DE BOUCHE',
  'AGRICULTEUR, ELEVEUR',
  "GERANT, CHEF D'ENTREPRISE COMMERCIALE",
  "GERANT, CHEF D'ENTREPRISE DE SERVICES",
  'MEDECIN GENERALISTE',
  'PHARMACIEN',
  'AVOCAT',
  'EXPERT COMPTABLE, COMPTABLE AGREE',
] as const;

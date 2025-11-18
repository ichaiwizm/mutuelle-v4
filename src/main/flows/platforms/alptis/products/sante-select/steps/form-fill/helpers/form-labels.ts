import type { AlptisProfession } from '../../../transformers/types';

/**
 * Consolidated form label mappings for Alptis form fields
 */

/**
 * Mapping des valeurs enum AlptisProfession vers les labels affichés dans l'UI
 * Utilisé pour interagir avec le composant custom dropdown via la textbox
 */
export const PROFESSION_LABELS: Record<AlptisProfession, string> = {
  AGRICULTEURS_EXPLOITANTS: 'Agriculteurs exploitants',
  ARTISANS: 'Artisans',
  CADRES: 'Cadres',
  CADRES_ET_EMPLOYES_DE_LA_FONCTION_PUBLIQUE: 'Cadres et employés de la fonction publique',
  CHEFS_D_ENTREPRISE: "Chefs d'entreprise",
  COMMERCANTS_ET_ASSIMILES: 'Commerçants et assimilés',
  EMPLOYES_AGENTS_DE_MAITRISE: 'Employés, agents de maîtrise',
  OUVRIERS: 'Ouvriers',
  PERSONNES_SANS_ACTIVITE_PROFESSIONNELLE: 'Personnes sans activité professionnelle',
  PROFESSIONS_LIBERALES_ET_ASSIMILES: 'Professions libérales et assimilés',
  RETRAITES: 'Retraités',
};

/**
 * Mapping des valeurs enum de régime obligatoire vers les labels affichés dans l'UI
 * Utilisé pour interagir avec le composant custom dropdown via la textbox
 */
export const REGIME_LABELS: Record<string, string> = {
  ALSACE_MOSELLE: 'Alsace / Moselle',
  AMEXA: 'Amexa',
  REGIME_SALARIES_AGRICOLES: 'Régime des salariés agricoles',
  SECURITE_SOCIALE: 'Sécurité sociale',
  SECURITE_SOCIALE_INDEPENDANTS: 'Sécurité sociale des indépendants',
};

/**
 * Mapping des valeurs de cadre d'exercice vers les labels affichés dans l'UI
 */
export const CADRE_EXERCICE_LABELS: Record<string, string> = {
  SALARIE: 'Salarié',
  INDEPENDANT_PRESIDENT_SASU_SAS: 'Indépendant Président SASU/SAS',
};

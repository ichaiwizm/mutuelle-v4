import type { AlptisProfession } from '../../../transformers/types';

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

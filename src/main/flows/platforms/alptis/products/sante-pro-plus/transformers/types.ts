/**
 * Types pour le transformer Alptis Santé Pro Plus
 */

import type { Lead } from '@/shared/types/lead';

/**
 * Données transformées pour Alptis Santé Pro Plus
 */
export type SanteProPlusFormData = {
  // Section: Mise en place du contrat
  mise_en_place: {
    remplacement_contrat: boolean;
    demande_resiliation?: 'Oui' | 'Non';
    date_effet: string; // DD/MM/YYYY
  };

  // Section: Adhérent(e)
  adherent: {
    civilite: 'monsieur' | 'madame';
    nom: string;
    prenom: string;
    date_naissance: string; // DD/MM/YYYY
    categorie_socioprofessionnelle: AlptisProfession;
    micro_entrepreneur: 'Oui' | 'Non'; // NOUVEAU: Toujours 'Non' par défaut
    cadre_exercice?: AlptisCadreExercice; // Conditionnel selon la profession (mêmes 5 que Santé Select)
    statut_professionnel?: AlptisStatutProfessionnel; // NOUVEAU: Seulement pour Chefs d'entreprise
    regime_obligatoire: AlptisRegime;
    code_postal: string;
    ville: string; // NOUVEAU: Auto-rempli via code postal
  };

  // Section: Conjoint(e) (optionnel) - SIMPLIFIÉ: pas de cadre_exercice
  conjoint?: {
    date_naissance: string;
    categorie_socioprofessionnelle: AlptisProfession;
    regime_obligatoire: AlptisRegime;
    // PAS de cadre_exercice pour le conjoint dans Santé Pro Plus
  };

  // Section: Enfant(s) (optionnel)
  enfants?: Array<{
    date_naissance: string;
    regime_obligatoire: AlptisRegime;
  }>;
};

/**
 * Professions Alptis (enum) - Identique à Santé Select
 */
export type AlptisProfession =
  | 'AGRICULTEURS_EXPLOITANTS'
  | 'ARTISANS'
  | 'CADRES'
  | 'CADRES_ET_EMPLOYES_DE_LA_FONCTION_PUBLIQUE'
  | 'CHEFS_D_ENTREPRISE'
  | 'COMMERCANTS_ET_ASSIMILES'
  | 'EMPLOYES_AGENTS_DE_MAITRISE'
  | 'OUVRIERS'
  | 'PERSONNES_SANS_ACTIVITE_PROFESSIONNELLE'
  | 'PROFESSIONS_LIBERALES_ET_ASSIMILES'
  | 'RETRAITES';

/**
 * Régimes sociaux Alptis (enum) - Identique à Santé Select
 */
export type AlptisRegime =
  | 'ALSACE_MOSELLE'
  | 'AMEXA'
  | 'REGIME_SALARIES_AGRICOLES'
  | 'SECURITE_SOCIALE'
  | 'SECURITE_SOCIALE_INDEPENDANTS';

/**
 * Cadre d'exercice (conditionnel selon la profession)
 * Apparaît pour: Agriculteurs, Artisans, Chefs d'entreprise, Commerçants, Professions libérales
 */
export type AlptisCadreExercice = 'SALARIE' | 'INDEPENDANT_PRESIDENT_SASU_SAS';

/**
 * Statut professionnel (NOUVEAU - seulement pour Chefs d'entreprise)
 */
export type AlptisStatutProfessionnel = 'ARTISAN_COMMERCANT' | 'PROFESSIONS_LIBERALES';

/**
 * Professions qui déclenchent l'affichage du champ "Cadre d'exercice"
 */
export const PROFESSIONS_WITH_CADRE_EXERCICE: AlptisProfession[] = [
  'AGRICULTEURS_EXPLOITANTS',
  'ARTISANS',
  'CHEFS_D_ENTREPRISE',
  'COMMERCANTS_ET_ASSIMILES',
  'PROFESSIONS_LIBERALES_ET_ASSIMILES',
];

/**
 * Profession qui déclenche l'affichage du champ "Statut professionnel"
 */
export const PROFESSION_WITH_STATUT_PROFESSIONNEL: AlptisProfession = 'CHEFS_D_ENTREPRISE';

/**
 * Résultat de transformation
 */
export type TransformResult = {
  success: boolean;
  data?: SanteProPlusFormData;
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
 * Résultat de validation
 */
export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

/**
 * Résultat d'éligibilité
 * Note: Santé Pro Plus est réservé aux TNS uniquement (pas de critère d'âge >= 60)
 */
export interface EligibilityResult {
  subscriberEligible: boolean;
  conjointEligible: boolean;
  shouldSwap: boolean;
  subscriberReason?: string;
  conjointReason?: string;
}

/**
 * Export du type Lead pour usage interne
 */
export type { Lead };

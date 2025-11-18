/**
 * Types pour le transformer Alptis Santé Select
 */

import type { Lead } from '@/shared/types/lead';

/**
 * Données transformées pour Alptis
 */
export type AlptisFormData = {
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
    cadre_exercice?: AlptisCadreExercice; // Conditionnel selon la profession
    regime_obligatoire: AlptisRegime;
    code_postal: string;
  };

  // Section: Conjoint(e) (optionnel)
  conjoint?: {
    date_naissance: string;
    categorie_socioprofessionnelle: AlptisProfession;
    cadre_exercice?: AlptisCadreExercice; // Conditionnel selon la profession
    regime_obligatoire: AlptisRegime;
  };

  // Section: Enfant(s) (optionnel)
  enfants?: Array<{
    date_naissance: string;
    regime_obligatoire: AlptisRegime;
  }>;
};

/**
 * Professions Alptis (enum)
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
 * Régimes sociaux Alptis (enum)
 */
export type AlptisRegime =
  | 'ALSACE_MOSELLE'
  | 'AMEXA'
  | 'REGIME_SALARIES_AGRICOLES'
  | 'SECURITE_SOCIALE'
  | 'SECURITE_SOCIALE_INDEPENDANTS';

/**
 * Cadre d'exercice (conditionnel selon la profession)
 */
export type AlptisCadreExercice = 'SALARIE' | 'INDEPENDANT_PRESIDENT_SASU_SAS';

/**
 * Résultat de transformation
 */
export type TransformResult = {
  success: boolean;
  data?: AlptisFormData;
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

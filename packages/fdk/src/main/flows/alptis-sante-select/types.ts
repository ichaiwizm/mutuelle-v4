/**
 * Types for Alptis Sante Select flow
 */

/** Professions Alptis (11 types) */
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

/** Regimes sociaux Alptis (5 types) */
export type AlptisRegime =
  | 'ALSACE_MOSELLE'
  | 'AMEXA'
  | 'REGIME_SALARIES_AGRICOLES'
  | 'SECURITE_SOCIALE'
  | 'SECURITE_SOCIALE_INDEPENDANTS';

/** Cadre d'exercice (conditionnel selon la profession) */
export type AlptisCadreExercice = 'SALARIE' | 'INDEPENDANT_PRESIDENT_SASU_SAS';

/** Civilite */
export type AlptisCivilite = 'monsieur' | 'madame';

/** Form data structure for Alptis Sante Select */
export interface AlptisFormData {
  mise_en_place: {
    remplacement_contrat: boolean;
    demande_resiliation?: 'Oui' | 'Non';
    date_effet: string; // DD/MM/YYYY
  };

  adherent: {
    civilite: AlptisCivilite;
    nom: string;
    prenom: string;
    date_naissance: string; // DD/MM/YYYY
    categorie_socioprofessionnelle: AlptisProfession;
    cadre_exercice?: AlptisCadreExercice;
    regime_obligatoire: AlptisRegime;
    code_postal: string;
  };

  conjoint?: {
    date_naissance: string;
    categorie_socioprofessionnelle: AlptisProfession;
    cadre_exercice?: AlptisCadreExercice;
    regime_obligatoire: AlptisRegime;
  };

  enfants?: Array<{
    date_naissance: string;
    regime_obligatoire: AlptisRegime;
  }>;
}

/** Eligibility result for swap logic */
export interface EligibilityResult {
  subscriberEligible: boolean;
  conjointEligible: boolean;
  shouldSwap: boolean;
  subscriberReason?: string;
  conjointReason?: string;
}

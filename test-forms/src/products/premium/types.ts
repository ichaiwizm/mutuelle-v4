import { FormDataInput } from '../../types.js';

/**
 * FormData étendu pour le produit Premium
 * Inclut des champs supplémentaires non présents dans les Leads
 */
export interface PremiumFormData extends FormDataInput {
  // Champs supplémentaires Premium
  numeroSecuriteSociale: string;
  mutuelleActuelle: string;
  antecedentsMedicaux: boolean;

  // Champs conditionnels
  regimeFiscal?: 'Micro-entreprise' | 'Réel simplifié' | 'Réel normal' | 'Non concerné';

  // Enfants enrichis avec information étudiant
  children?: Array<{
    dateNaissance: string;
    order: number;
    estEtudiant?: boolean; // Conditionnel si > 18 ans
  }>;
}

/**
 * Niveaux de couverture pour le produit Premium
 */
export type CoverageLevel = 'Essentiel' | 'Confort' | 'Premium' | 'Excellence';

/**
 * Sélection des niveaux de couverture dans la grille interactive
 */
export interface PremiumQuoteSelection {
  soinsMedicaux: CoverageLevel;
  hospitalisation: CoverageLevel;
  optique: CoverageLevel;
  dentaire: CoverageLevel;
  medecinesDouces: CoverageLevel;
}

/**
 * Quote finale avec détail des prix
 */
export interface PremiumQuote {
  id: string;
  formData: PremiumFormData;
  selection: PremiumQuoteSelection;
  price: number;
  breakdown: {
    base: number;
    soinsMedicaux: number;
    hospitalisation: number;
    optique: number;
    dentaire: number;
    medecinesDouces: number;
  };
}

/**
 * Résultat de validation avec erreurs
 */
export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Résultat d'adaptation avec warnings
 */
export interface AdaptationResult<T> {
  adapted: T;
  warnings: string[];
}

/**
 * Résultat d'enrichissement avec champs ajoutés
 */
export interface EnrichmentResult<T> {
  enriched: T;
  addedFields: string[];
}

/**
 * Mapping de profession avec niveau de confiance
 */
export interface ProfessionMapping {
  leadValue: string;
  formValue: string;
  confidence: 'exact' | 'mapped' | 'fallback';
}

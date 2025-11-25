/**
 * SwissLifeOne SLSIS Result Types
 * Type definitions for transformation and validation results
 */

import type { SwissLifeOneFormData } from './form-data';

/**
 * Resultat de transformation avec gestion d'erreurs
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

/**
 * Resultat de validation
 */
export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

/**
 * Resultat de validation de compatibilite
 */
export type CompatibilityResult = {
  compatible: boolean;
  reason?: string;
};

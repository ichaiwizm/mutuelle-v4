/**
 * SwissLifeOne SLSIS Transformer Types
 *
 * This file re-exports from the modular types/ directory.
 * For direct imports of specific type categories, use:
 *   import type { SwissLifeProfession } from './types/enums'
 *   import type { SwissLifeOneFormData } from './types/form-data'
 *   import type { TransformResult } from './types/results'
 */
export type {
  // Enums
  SwissLifeProfession,
  SwissLifeRegime,
  SwissLifeStatut,
  SwissLifeGamme,
  TypeSimulation,
  AyantDroit,
  DepartementCode,
  // Form data structures
  SwissLifeOneFormData,
  ProjetData,
  BesoinsData,
  AssurePrincipalData,
  ConjointData,
  EnfantsData,
  EnfantData,
  GammesOptionsData,
  // Result types
  TransformResult,
  TransformError,
  TransformWarning,
  ValidationResult,
  CompatibilityResult,
} from './types/index';

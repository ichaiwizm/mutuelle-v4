/**
 * SwissLifeOne SLSIS Types
 * Re-exports all type definitions from modular files
 */

// Enums
export type {
  SwissLifeProfession,
  SwissLifeRegime,
  SwissLifeStatut,
  SwissLifeGamme,
  TypeSimulation,
  AyantDroit,
  DepartementCode,
} from './enums';

// Form data structures
export type {
  SwissLifeOneFormData,
  ProjetData,
  BesoinsData,
  AssurePrincipalData,
  ConjointData,
  EnfantsData,
  EnfantData,
  GammesOptionsData,
} from './form-data';

// Result types
export type {
  TransformResult,
  TransformError,
  TransformWarning,
  ValidationResult,
  CompatibilityResult,
} from './results';

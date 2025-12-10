/**
 * Alptis Santé Pro Plus - Product Entry Point
 *
 * Mutuelle santé pour travailleurs non salariés (TNS)
 */

// Transformers
export { LeadTransformer } from './transformers/LeadTransformer';
export type {
  SanteProPlusFormData,
  AlptisProfession,
  AlptisRegime,
  AlptisCadreExercice,
  AlptisStatutProfessionnel,
  TransformResult,
  TransformError,
  TransformWarning,
  ValidationResult,
  EligibilityResult,
} from './transformers/types';

// Form Fill
export { FormFillOrchestrator } from './steps/form-fill/FormFillOrchestrator';
export { Section1Fill, Section2Fill, Section3Fill, Section4Fill } from './steps/form-fill/sections';

// Navigation
export { NavigationStep } from './steps/navigation';

// Selectors
export {
  SECTION_1_SELECTORS,
  SECTION_2_SELECTORS,
  SECTION_3_SELECTORS,
  SECTION_4_SELECTORS,
  ERROR_SELECTORS,
  BUTTON_SELECTORS,
} from './steps/form-fill/selectors';

/**
 * SwissLifeOne SLSIS Transformers - Public API
 */

// Main transformer
export { SwissLifeOneLeadTransformer } from './LeadTransformer';

// Types
export type {
  SwissLifeOneFormData,
  ProjetData,
  BesoinsData,
  AssurePrincipalData,
  ConjointData,
  EnfantsData,
  EnfantData,
  GammesOptionsData,
  TransformResult,
  TransformError,
  TransformWarning,
  ValidationResult,
  CompatibilityResult,
  SwissLifeProfession,
  SwissLifeRegime,
  SwissLifeStatut,
  SwissLifeGamme,
  TypeSimulation,
  AyantDroit,
  DepartementCode,
} from './types';

// Validators (for testing)
export { validateLead } from './validators/lead-validator';
export {
  validateSubscriberAge,
  validateSpouseAge,
  validateChildAge,
  calculateAge,
} from './validators/age-validator';
export {
  validateDateFormat,
  validateCodePostalFormat,
  validateNomFormat,
  validatePrenomFormat,
} from './validators/format-validator';

// Mappers (for testing/debugging)
export { mapProfession, PROFESSION_LABELS } from './mappers/profession-mapper';
export { mapRegimeSocial, isTNSRegime, REGIME_LABELS } from './mappers/regime-mapper';
export { mapStatut, STATUT_LABELS } from './mappers/statut-mapper';
export { mapGamme, GAMME_LABELS } from './mappers/gamme-mapper';
export { mapCivilite } from './mappers/civilite-mapper';

// Utilities (for testing/debugging)
export { extractDepartement, isValidDepartement, DEPARTEMENT_NAMES } from './utils/departement-extractor';
export {
  parseDate,
  formatDate,
  transformBirthDate,
  transformDateEffet,
} from './transformers/date-transformer';

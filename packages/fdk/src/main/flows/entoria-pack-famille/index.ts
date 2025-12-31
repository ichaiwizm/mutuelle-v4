/**
 * Entoria Pack Famille Flow Definition
 * Complete flow for Entoria Sante TNS form automation
 */

// Config
export { config, type EntoriaFlowConfig } from './config';

// Selectors
export { SELECTORS, type Selectors } from './selectors';

// Types
export {
  type FormuleType,
  type FrequenceType,
  type ProfilData,
  type BesoinData,
  type GarantiesData,
  type PackFamilleFormData,
  type TransformResult,
  type TransformError,
  type TransformWarning,
  DEFAULTS,
} from './types';

// Transformer
export {
  formatDate,
  getDateEffet,
  isValidDateEffet,
  getDepartement,
  mapProfession,
  transformLead,
  transformLeadSafe,
} from './transformer';

// Profession mappings
export {
  PROFESSION_MAPPING,
  DEFAULT_PROFESSION,
  COMMON_PROFESSIONS,
} from './profession-mappings';

// Steps
export {
  authStep,
  executeAuth,
  navigationStep,
  executeNavigation,
  profilStep,
  executeProfil,
  besoinStep,
  executeBesoin,
  garantiesStep,
  executeGaranties,
  submitStep,
  submitProfil,
  submitBesoin,
  submitGaranties,
  stepOrder,
  allSteps,
  type AuthCredentials,
  type AuthStepResult,
  type StepResult,
} from './steps';

// Flow definition
import { config } from './config';
import { stepOrder, allSteps } from './steps';

export const entoriaPackFamilleFlow = {
  id: 'entoria-pack-famille',
  name: 'Entoria Pack Famille',
  description: 'Devis automation for Entoria Pack Famille (Sante TNS)',
  version: '1.0.0',
  platform: config.platform,
  product: config.product,
  formUrl: config.formUrl,
  stepOrder,
  steps: allSteps,
};

export default entoriaPackFamilleFlow;

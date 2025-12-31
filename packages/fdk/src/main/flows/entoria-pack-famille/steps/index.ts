/**
 * Steps index for Entoria Pack Famille flow
 */

// Step exports
export { authStep, executeAuth, type AuthCredentials, type AuthStepResult } from './auth';
export { navigationStep, executeNavigation } from './navigation';
export { profilStep, executeProfil } from './profil';
export { besoinStep, executeBesoin, submitBesoin } from './besoin';
export { garantiesStep, executeGaranties } from './garanties';
export { submitStep, submitProfil, submitGaranties } from './submit';

// Step result type
export type { StepResult } from './profil';

// Step order for flow execution
export const stepOrder = [
  'entoria-auth',
  'entoria-navigation',
  'entoria-profil',
  'entoria-besoin',
  'entoria-garanties',
  'entoria-submit',
] as const;

// All steps array
export const allSteps = [
  { id: 'entoria-auth', name: 'Authentication', type: 'auth' },
  { id: 'entoria-navigation', name: 'Navigate to Form', type: 'navigation' },
  { id: 'entoria-profil', name: 'Fill Profil (Step 1)', type: 'form-fill' },
  { id: 'entoria-besoin', name: 'Fill Besoin (Step 2)', type: 'form-fill' },
  { id: 'entoria-garanties', name: 'Fill Garanties (Step 3)', type: 'form-fill' },
  { id: 'entoria-submit', name: 'Submit Form', type: 'custom' },
] as const;

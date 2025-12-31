/**
 * Steps index - re-export all steps for SwissLife One SLSIS
 */
export { authStep } from './auth';
export { navigationStep } from './navigation';
export { projetStep } from './projet';
export { besoinsStep } from './besoins';
export { typeSimulationStep } from './type-simulation';
export { assurePrincipalStep } from './assure-principal';
export { conjointStep } from './conjoint';
export { enfantsStep, createEnfantActions } from './enfants';
export { gammesOptionsStep } from './gammes-options';
export { submitStep } from './submit';

// Step order for flow execution
export const stepOrder = [
  'swisslife-auth',
  'swisslife-navigation',
  'swisslife-projet',
  'swisslife-besoins',
  'swisslife-type-simulation',
  'swisslife-assure-principal',
  'swisslife-conjoint',
  'swisslife-enfants',
  'swisslife-gammes-options',
  'swisslife-submit',
] as const;

export type StepId = (typeof stepOrder)[number];

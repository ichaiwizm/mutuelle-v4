/**
 * Steps index - re-export all steps for Alptis Sante Select
 */
export { authStep } from './auth';
export { navigationStep } from './navigation';
export { miseEnPlaceStep } from './mise-en-place';
export { adherentStep } from './adherent';
export { conjointStep } from './conjoint';
export { enfantsStep, addChildAction } from './enfants';
export { submitStep, saveGarantiesStep, confirmSaveStep } from './submit';

// Step order for flow execution
export const stepOrder = [
  'alptis-auth',
  'alptis-navigation',
  'alptis-mise-en-place',
  'alptis-adherent',
  'alptis-conjoint',
  'alptis-enfants',
  'alptis-submit',
  'alptis-save-garanties',
  'alptis-confirm-save',
] as const;

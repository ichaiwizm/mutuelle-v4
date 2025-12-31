/**
 * Steps index - re-export all steps for Alptis Sante Pro Plus
 */
export { authStep } from './auth';
export { navigationStep } from './navigation';
export { miseEnPlaceStep } from './mise-en-place';
export { adherentStep } from './adherent';
export { conjointStep } from './conjoint';
export { enfantsStep } from './enfants';
export { submitStep } from './submit';

/** Step order for flow execution */
export const stepOrder = [
  'alptis-auth',
  'alptis-navigation',
  'alptis-mise-en-place',
  'alptis-adherent',
  'alptis-conjoint',
  'alptis-enfants',
  'alptis-submit',
] as const;

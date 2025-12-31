/**
 * Alptis Sante Pro Plus Flow Definition
 * TNS-only health insurance product
 */
import { defineFlow } from '@/core/define-flow';
import { config } from './config';
import {
  authStep,
  navigationStep,
  miseEnPlaceStep,
  adherentStep,
  conjointStep,
  enfantsStep,
  submitStep,
  stepOrder,
} from './steps';

export const alptisSanteProPlusFlow = defineFlow({
  id: 'alptis-sante-pro-plus',
  name: 'Alptis Sante Pro Plus',
  description: 'Devis automatisation for Alptis Sante Pro Plus (TNS only)',
  version: '1.0.0',
  steps: [
    authStep,
    navigationStep,
    miseEnPlaceStep,
    adherentStep,
    conjointStep,
    enfantsStep,
    submitStep,
  ],
  metadata: {
    platform: config.platform,
    product: config.product,
    formUrl: config.formUrl,
    stepOrder,
  },
});

// Re-export configuration and types
export { config } from './config';
export { selectors } from './selectors';
export { transformerConfig, mappers, validations, checkEligibility } from './transformer';
export { professionMapper, regimeMapper, statutProfessionnelMapper } from './transformer';
export * from './steps';
export * from './types';

export default alptisSanteProPlusFlow;

/**
 * Alptis Sante Select Flow Definition
 * Mutuelle sante individuelle automation flow
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
  saveGarantiesStep,
  confirmSaveStep,
  stepOrder,
} from './steps';

export const alptisSanteSelectFlow = defineFlow({
  id: 'alptis-sante-select',
  name: 'Alptis Sante Select',
  description: 'Devis automatisation for Alptis Sante Select product',
  version: '1.0.0',
  steps: [
    authStep,
    navigationStep,
    miseEnPlaceStep,
    adherentStep,
    conjointStep,
    enfantsStep,
    submitStep,
    saveGarantiesStep,
    confirmSaveStep,
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
export { transformerConfig, mappers, validations, eligibilityRules } from './transformer';
export { professionMapper, regimeMapper, civiliteMapper, cadreExerciceMapper } from './transformer';
export * from './steps';
export * from './types';

export default alptisSanteSelectFlow;

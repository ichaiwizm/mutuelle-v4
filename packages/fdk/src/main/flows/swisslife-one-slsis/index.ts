/**
 * SwissLife One SLSIS Flow Definition
 * FDK format flow for SLSIS product automation
 */
import { defineFlow } from '@/core/define-flow';
import { config } from './config';
import {
  authStep,
  navigationStep,
  projetStep,
  besoinsStep,
  typeSimulationStep,
  assurePrincipalStep,
  conjointStep,
  enfantsStep,
  gammesOptionsStep,
  submitStep,
  stepOrder,
} from './steps';

export const swisslifeOneSLSISFlow = defineFlow({
  id: 'swisslife-one-slsis',
  name: 'SwissLife One SLSIS',
  description: 'Devis automation for SwissLife One SLSIS product',
  version: '1.0.0',
  steps: [
    authStep,
    navigationStep,
    projetStep,
    besoinsStep,
    typeSimulationStep,
    assurePrincipalStep,
    conjointStep,
    enfantsStep,
    gammesOptionsStep,
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
export { transformerConfig, mappers, validations } from './transformer';
export { generateProjectName, determineTypeSimulation } from './transformer';
export { professionMapper, regimeMapper, statutMapper, gammeMapper } from './transformer';
export * from './types';
export * from './steps';

export default swisslifeOneSLSISFlow;

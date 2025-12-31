/**
 * Section 3: Type Simulation step for SwissLife One SLSIS
 * Selects simulation type based on family structure
 */
import type { FormFillStep, FieldDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';

const typeSimulationFields: FieldDefinition[] = [
  {
    id: 'typeSimulation',
    type: 'select',
    selector: selectors.typeSimulation.typeSimulation,
    source: '{{formData.typeSimulation}}',
    label: 'Type de simulation',
    waitFor: true,
  },
];

export const typeSimulationStep: FormFillStep = {
  id: 'swisslife-type-simulation',
  name: 'Section 3: Type Simulation',
  description: 'Select simulation type based on family structure',
  type: 'form-fill',
  timeout: config.timeouts.default,
  retry: {
    attempts: 2,
    delayMs: 500,
  },
  fields: typeSimulationFields,
  beforeFill: [
    {
      action: 'waitFor',
      selector: selectors.typeSimulation.typeSimulation.primary.value,
      timeout: 10000,
    },
  ],
};

/**
 * Section 2: Besoins step for SwissLife One SLSIS
 * Fills coverage needs with radio selections
 */
import type { FormFillStep, FieldDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';

const besoinsFields: FieldDefinition[] = [
  {
    id: 'couvertureSoins',
    type: 'radio',
    selector: selectors.besoins.couvertureSoins,
    source: '{{formData.couvertureSoins}}',
    label: 'Couverture soins',
    waitFor: true,
  },
  {
    id: 'indemniteHospitalisation',
    type: 'radio',
    selector: selectors.besoins.indemniteHospitalisation,
    source: '{{formData.indemniteHospitalisation}}',
    label: 'Indemnite hospitalisation',
  },
  {
    id: 'indemniteMaladieGrave',
    type: 'radio',
    selector: selectors.besoins.indemniteMaladieGrave,
    source: '{{formData.indemniteMaladieGrave}}',
    label: 'Indemnite maladie grave',
  },
];

export const besoinsStep: FormFillStep = {
  id: 'swisslife-besoins',
  name: 'Section 2: Besoins',
  description: 'Fill coverage needs for SLSIS simulation',
  type: 'form-fill',
  timeout: config.timeouts.default,
  retry: {
    attempts: 2,
    delayMs: 500,
  },
  fields: besoinsFields,
  beforeFill: [
    {
      action: 'waitFor',
      selector: selectors.besoins.couvertureSoins.primary.value,
      timeout: 10000,
    },
  ],
};

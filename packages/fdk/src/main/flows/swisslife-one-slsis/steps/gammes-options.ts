/**
 * Section 7: Gammes et Options step for SwissLife One SLSIS
 * Fills gamme selection and additional options
 */
import type { FormFillStep, FieldDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';
import { validations } from '../transformer';

const gammesOptionsFields: FieldDefinition[] = [
  {
    id: 'gamme',
    type: 'select',
    selector: selectors.gammesOptions.gamme,
    source: '{{formData.gamme}}',
    label: 'Gamme',
    waitFor: true,
  },
  {
    id: 'madelin',
    type: 'checkbox',
    selector: selectors.gammesOptions.madelin,
    source: '{{formData.madelin}}',
    label: 'Loi Madelin',
    optional: true,
  },
  {
    id: 'repriseContrat',
    type: 'checkbox',
    selector: selectors.gammesOptions.repriseContrat,
    source: '{{formData.repriseContrat}}',
    label: 'Reprise de contrat',
    optional: true,
  },
  {
    id: 'resiliation',
    type: 'checkbox',
    selector: selectors.gammesOptions.resiliation,
    source: '{{formData.resiliation}}',
    label: 'Resiliation',
    optional: true,
  },
  {
    id: 'dateEffet',
    type: 'date',
    selector: selectors.gammesOptions.dateEffet,
    source: '{{formData.dateEffet}}',
    transform: [{ name: 'toDate', args: { format: 'DD/MM/YYYY' } }],
    validation: validations.dateEffet,
    label: 'Date effet',
  },
];

export const gammesOptionsStep: FormFillStep = {
  id: 'swisslife-gammes-options',
  name: 'Section 7: Gammes et Options',
  description: 'Fill gamme selection and options',
  type: 'form-fill',
  timeout: config.timeouts.default,
  retry: { attempts: 2, delayMs: 500 },
  fields: gammesOptionsFields,
  beforeFill: [
    { action: 'waitFor', selector: selectors.gammesOptions.gamme.primary.value, timeout: 10000 },
  ],
};

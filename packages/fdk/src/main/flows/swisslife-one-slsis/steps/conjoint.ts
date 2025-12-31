/**
 * Section 5: Conjoint step for SwissLife One SLSIS
 * Conditional step - only fills if conjoint data present
 */
import type { FormFillStep, FieldDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';
import { validations } from '../transformer';

const conjointFields: FieldDefinition[] = [
  {
    id: 'dateNaissance',
    type: 'date',
    selector: selectors.conjoint.dateNaissance,
    source: '{{formData.conjoint.dateNaissance}}',
    transform: [{ name: 'toDate', args: { format: 'DD/MM/YYYY' } }],
    validation: validations.dateNaissance,
    label: 'Date de naissance conjoint',
    waitFor: true,
  },
  {
    id: 'profession',
    type: 'select',
    selector: selectors.conjoint.profession,
    source: '{{formData.conjoint.profession}}',
    label: 'Profession conjoint',
  },
  {
    id: 'regime',
    type: 'select',
    selector: selectors.conjoint.regime,
    source: '{{formData.conjoint.regime}}',
    label: 'Regime conjoint',
  },
  {
    id: 'statut',
    type: 'select',
    selector: selectors.conjoint.statut,
    source: '{{formData.conjoint.statut}}',
    label: 'Statut professionnel conjoint',
    optional: true,
  },
];

export const conjointStep: FormFillStep = {
  id: 'swisslife-conjoint',
  name: 'Section 5: Conjoint',
  description: 'Fill spouse details (conditional)',
  type: 'form-fill',
  timeout: config.timeouts.default,
  condition: {
    expression: '{{formData.conjoint}}',
    type: 'if',
  },
  optional: true,
  retry: { attempts: 2, delayMs: 500 },
  fields: conjointFields,
  beforeFill: [
    { action: 'waitFor', selector: selectors.conjoint.dateNaissance.primary.value, timeout: 10000 },
  ],
};

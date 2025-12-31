/**
 * Mise en place step (Section 1) for Alptis Sante Pro Plus
 */
import type { FormFillStep, FieldDefinition, ActionDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';

const miseEnPlaceFields: FieldDefinition[] = [
  {
    id: 'dateEffet',
    type: 'date',
    selector: selectors.miseEnPlace.dateEffet,
    source: '{{lead.dateEffet}}',
    transform: [{ name: 'toDate', args: { format: 'DD/MM/YYYY' } }],
    label: 'Date effet',
    waitFor: true,
  },
  {
    id: 'formule',
    type: 'select',
    selector: selectors.miseEnPlace.formule,
    source: '{{lead.formule}}',
    label: 'Formule',
    optional: false,
  },
];

const beforeFillActions: ActionDefinition[] = [
  {
    action: 'waitFor',
    selector: selectors.miseEnPlace.dateEffet.primary.value,
    timeout: 10000,
    state: 'visible',
  },
];

const afterFillActions: ActionDefinition[] = [
  {
    action: 'click',
    selector: selectors.navigation.nextStep.value,
    waitAfter: 500,
  },
  {
    action: 'waitForNavigation',
    timeout: config.timeouts.navigation,
  },
];

export const miseEnPlaceStep: FormFillStep = {
  id: 'alptis-mise-en-place',
  name: 'Mise en place',
  description: 'Fill Section 1 - Date effet and formule',
  type: 'form-fill',
  timeout: config.timeouts.default,
  retry: {
    attempts: 2,
    delayMs: 500,
  },
  fields: miseEnPlaceFields,
  beforeFill: beforeFillActions,
  afterFill: afterFillActions,
};

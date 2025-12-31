/**
 * Enfants step for Alptis Sante Select (Section 4)
 * Repeat form-fill for children information
 */
import type { FormFillStep, FieldDefinition, ActionDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';
import { validations } from '../transformer';

const enfantFields: FieldDefinition[] = [
  {
    id: 'date_naissance',
    type: 'date',
    selector: selectors.enfants.dateNaissance,
    source: '{{item.date_naissance}}',
    transform: [{ name: 'toDate', args: { format: 'DD/MM/YYYY' } }],
    validation: validations.dateNaissance,
    label: 'Date de naissance enfant',
    waitFor: true,
  },
  {
    id: 'regime_obligatoire',
    type: 'select',
    selector: selectors.enfants.regimeObligatoire,
    source: '{{item.regime_obligatoire}}',
    label: 'Regime obligatoire enfant',
  },
];

const beforeActions: ActionDefinition[] = [
  {
    action: 'click',
    selector: "[class*='totem-toggle__input']",
    waitBefore: 500,
  },
  {
    action: 'waitFor',
    selector: "input[placeholder='Ex : 01/01/2020']",
    state: 'visible',
    timeout: 5000,
  },
];

const addChildAction: ActionDefinition = {
  action: 'click',
  selector: "button:has-text('Ajouter un enfant')",
  waitAfter: 500,
};

export const enfantsStep: FormFillStep = {
  id: 'alptis-enfants',
  name: 'Informations Enfants',
  description: 'Section 4: Children information fields (repeat)',
  type: 'form-fill',
  timeout: config.timeouts.default,
  retry: { attempts: 2, delayMs: 500 },
  condition: {
    expression: '{{lead.enfants.length}} > 0',
    type: 'if',
  },
  optional: true,
  fields: enfantFields,
  beforeFill: beforeActions,
};

// Export add child action for use in repeat logic
export { addChildAction };

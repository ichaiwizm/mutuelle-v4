/**
 * Enfants step for Alptis Sante Pro Plus
 * Handles multiple children with repeat pattern
 */
import type { FormFillStep, FieldDefinition, ActionDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';

const enfantFields: FieldDefinition[] = [
  {
    id: 'nom',
    type: 'text',
    selector: selectors.enfants.nom,
    source: '{{item.nom}}',
    label: 'Nom enfant',
  },
  {
    id: 'prenom',
    type: 'text',
    selector: selectors.enfants.prenom,
    source: '{{item.prenom}}',
    label: 'Prenom enfant',
  },
  {
    id: 'dateNaissance',
    type: 'date',
    selector: selectors.enfants.dateNaissance,
    source: '{{item.dateNaissance}}',
    transform: [{ name: 'toDate', args: { format: 'DD/MM/YYYY' } }],
    label: 'Date de naissance enfant',
  },
];

const beforeFillActions: ActionDefinition[] = [
  {
    action: 'click',
    selector: selectors.enfants.addEnfant.value,
    waitAfter: 500,
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

export const enfantsStep: FormFillStep = {
  id: 'alptis-enfants',
  name: 'Enfants',
  description: 'Fill children information',
  type: 'form-fill',
  timeout: config.timeouts.default,
  optional: true,
  condition: {
    expression: '{{lead.enfants.length > 0}}',
    type: 'if',
  },
  retry: {
    attempts: 2,
    delayMs: 500,
  },
  fields: enfantFields,
  beforeFill: beforeFillActions,
  afterFill: afterFillActions,
};

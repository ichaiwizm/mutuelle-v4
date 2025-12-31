/**
 * Conjoint step for Alptis Sante Pro Plus
 * Simplified version - no cadre_exercice field
 */
import type { FormFillStep, FieldDefinition, ActionDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';

const conjointFields: FieldDefinition[] = [
  {
    id: 'hasConjoint',
    type: 'checkbox',
    selector: selectors.conjoint.hasConjoint,
    source: '{{lead.conjoint ? true : false}}',
    label: 'Inclure conjoint',
  },
  {
    id: 'civilite',
    type: 'select',
    selector: selectors.conjoint.civilite,
    source: '{{lead.conjoint.civilite}}',
    label: 'Civilite conjoint',
    optional: true,
  },
  {
    id: 'nom',
    type: 'text',
    selector: selectors.conjoint.nom,
    source: '{{lead.conjoint.nom}}',
    label: 'Nom conjoint',
    optional: true,
  },
  {
    id: 'prenom',
    type: 'text',
    selector: selectors.conjoint.prenom,
    source: '{{lead.conjoint.prenom}}',
    label: 'Prenom conjoint',
    optional: true,
  },
  {
    id: 'dateNaissance',
    type: 'date',
    selector: selectors.conjoint.dateNaissance,
    source: '{{lead.conjoint.dateNaissance}}',
    transform: [{ name: 'toDate', args: { format: 'DD/MM/YYYY' } }],
    label: 'Date de naissance conjoint',
    optional: true,
  },
  {
    id: 'regime',
    type: 'select',
    selector: selectors.conjoint.regime,
    source: '{{lead.conjoint.regime}}',
    label: 'Regime conjoint',
    optional: true,
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

export const conjointStep: FormFillStep = {
  id: 'alptis-conjoint',
  name: 'Conjoint',
  description: 'Fill conjoint information (simplified)',
  type: 'form-fill',
  timeout: config.timeouts.default,
  optional: true,
  condition: {
    expression: '{{lead.conjoint}}',
    type: 'if',
  },
  retry: {
    attempts: 2,
    delayMs: 500,
  },
  fields: conjointFields,
  afterFill: afterFillActions,
};

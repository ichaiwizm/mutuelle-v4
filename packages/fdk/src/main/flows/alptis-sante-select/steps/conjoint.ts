/**
 * Conjoint step for Alptis Sante Select (Section 3)
 * Conditional form-fill for spouse information
 */
import type { FormFillStep, FieldDefinition, ActionDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';
import { validations } from '../transformer';

const conjointFields: FieldDefinition[] = [
  {
    id: 'date_naissance',
    type: 'date',
    selector: selectors.conjoint.dateNaissance,
    source: '{{lead.conjoint.date_naissance}}',
    transform: [{ name: 'toDate', args: { format: 'DD/MM/YYYY' } }],
    validation: validations.dateNaissance,
    label: 'Date de naissance conjoint',
    waitFor: true,
  },
  {
    id: 'categorie_socioprofessionnelle',
    type: 'select',
    selector: selectors.conjoint.categorieSocioprofessionnelle,
    source: '{{lead.conjoint.categorie_socioprofessionnelle}}',
    label: 'Categorie socioprofessionnelle conjoint',
  },
  {
    id: 'cadre_exercice',
    type: 'select',
    selector: selectors.conjoint.cadreExercice,
    source: '{{lead.conjoint.cadre_exercice}}',
    label: 'Cadre exercice conjoint',
    optional: true,
  },
  {
    id: 'regime_obligatoire',
    type: 'select',
    selector: selectors.conjoint.regimeObligatoire,
    source: '{{lead.conjoint.regime_obligatoire}}',
    label: 'Regime obligatoire conjoint',
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
    selector: '#categories-socio-professionnelles-conjoint',
    state: 'visible',
    timeout: 5000,
  },
];

export const conjointStep: FormFillStep = {
  id: 'alptis-conjoint',
  name: 'Informations Conjoint',
  description: 'Section 3: Spouse information fields (conditional)',
  type: 'form-fill',
  timeout: config.timeouts.default,
  retry: { attempts: 2, delayMs: 500 },
  condition: {
    expression: '{{lead.conjoint}} !== undefined',
    type: 'if',
  },
  optional: true,
  fields: conjointFields,
  beforeFill: beforeActions,
};

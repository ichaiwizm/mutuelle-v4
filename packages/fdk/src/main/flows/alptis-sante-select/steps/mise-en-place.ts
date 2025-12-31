/**
 * Mise en place step for Alptis Sante Select (Section 1)
 * Fields: remplacement_contrat, demande_resiliation, date_effet
 */
import type { FormFillStep, FieldDefinition, ActionDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';
import { validations } from '../transformer';

const miseEnPlaceFields: FieldDefinition[] = [
  {
    id: 'remplacement_contrat',
    type: 'checkbox',
    selector: selectors.miseEnPlace.remplacementContrat,
    source: '{{lead.mise_en_place.remplacement_contrat}}',
    label: 'Remplacement contrat',
    optional: true,
  },
  {
    id: 'demande_resiliation',
    type: 'radio',
    selector: selectors.miseEnPlace.demandeResiliation.primary,
    source: '{{lead.mise_en_place.demande_resiliation}}',
    label: 'Demande resiliation',
    optional: true,
  },
  {
    id: 'date_effet',
    type: 'date',
    selector: selectors.miseEnPlace.dateEffet,
    source: '{{lead.mise_en_place.date_effet}}',
    transform: [{ name: 'toDate', args: { format: 'DD/MM/YYYY' } }],
    validation: validations.dateEffet,
    label: 'Date effet',
    waitFor: true,
  },
];

const beforeActions: ActionDefinition[] = [
  {
    action: 'waitFor',
    selector: "[class*='totem-toggle__input']",
    state: 'visible',
    timeout: 10000,
  },
];

export const miseEnPlaceStep: FormFillStep = {
  id: 'alptis-mise-en-place',
  name: 'Mise en place du contrat',
  description: 'Section 1: Contract setup fields',
  type: 'form-fill',
  timeout: config.timeouts.default,
  retry: { attempts: 2, delayMs: 500 },
  fields: miseEnPlaceFields,
  beforeFill: beforeActions,
};

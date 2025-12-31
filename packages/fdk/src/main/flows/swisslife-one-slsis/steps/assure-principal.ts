/**
 * Section 4: Assure Principal step for SwissLife One SLSIS
 * Fills 5 fields for main insured person
 */
import type { FormFillStep, FieldDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';
import { validations } from '../transformer';

const assurePrincipalFields: FieldDefinition[] = [
  {
    id: 'dateNaissance',
    type: 'date',
    selector: selectors.assurePrincipal.dateNaissance,
    source: '{{formData.assurePrincipal.dateNaissance}}',
    transform: [{ name: 'toDate', args: { format: 'DD/MM/YYYY' } }],
    validation: validations.dateNaissance,
    label: 'Date de naissance',
    waitFor: true,
  },
  {
    id: 'profession',
    type: 'select',
    selector: selectors.assurePrincipal.profession,
    source: '{{formData.assurePrincipal.profession}}',
    label: 'Profession',
  },
  {
    id: 'regime',
    type: 'select',
    selector: selectors.assurePrincipal.regime,
    source: '{{formData.assurePrincipal.regime}}',
    label: 'Regime',
  },
  {
    id: 'statut',
    type: 'select',
    selector: selectors.assurePrincipal.statut,
    source: '{{formData.assurePrincipal.statut}}',
    label: 'Statut professionnel',
    optional: true,
  },
  {
    id: 'codePostal',
    type: 'text',
    selector: selectors.assurePrincipal.codePostal,
    source: '{{formData.assurePrincipal.codePostal}}',
    validation: validations.codePostal,
    label: 'Code postal',
  },
];

export const assurePrincipalStep: FormFillStep = {
  id: 'swisslife-assure-principal',
  name: 'Section 4: Assure Principal',
  description: 'Fill main insured person details',
  type: 'form-fill',
  timeout: config.timeouts.default,
  retry: { attempts: 2, delayMs: 500 },
  fields: assurePrincipalFields,
  beforeFill: [
    { action: 'waitFor', selector: selectors.assurePrincipal.dateNaissance.primary.value, timeout: 10000 },
  ],
};

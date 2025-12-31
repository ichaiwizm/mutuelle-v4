/**
 * Section 1: Projet step for SwissLife One SLSIS
 * Fills project name field
 */
import type { FormFillStep, FieldDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';

const projetFields: FieldDefinition[] = [
  {
    id: 'nomProjet',
    type: 'text',
    selector: selectors.projet.nomProjet,
    source: '{{formData.nomProjet}}',
    label: 'Nom du projet',
    waitFor: true,
  },
];

export const projetStep: FormFillStep = {
  id: 'swisslife-projet',
  name: 'Section 1: Projet',
  description: 'Fill project name for SLSIS simulation',
  type: 'form-fill',
  timeout: config.timeouts.default,
  retry: {
    attempts: 2,
    delayMs: 500,
  },
  fields: projetFields,
  beforeFill: [
    {
      action: 'waitFor',
      selector: selectors.projet.nomProjet.primary.value,
      timeout: 10000,
    },
  ],
};

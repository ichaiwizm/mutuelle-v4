/**
 * Adherent step for Alptis Sante Select (Section 2)
 * Fields: civilite, nom, prenom, date_naissance, profession, cadre_exercice, regime, code_postal
 */
import type { FormFillStep, FieldDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';
import { validations } from '../transformer';

const adherentFields: FieldDefinition[] = [
  {
    id: 'civilite',
    type: 'radio',
    selector: selectors.adherent.civilite.primary,
    source: '{{lead.adherent.civilite}}',
    label: 'Civilite',
  },
  {
    id: 'nom',
    type: 'text',
    selector: selectors.adherent.nom,
    source: '{{lead.adherent.nom}}',
    validation: validations.nom,
    label: 'Nom',
  },
  {
    id: 'prenom',
    type: 'text',
    selector: selectors.adherent.prenom,
    source: '{{lead.adherent.prenom}}',
    validation: validations.prenom,
    label: 'Prenom',
  },
  {
    id: 'date_naissance',
    type: 'date',
    selector: selectors.adherent.dateNaissance,
    source: '{{lead.adherent.date_naissance}}',
    transform: [{ name: 'toDate', args: { format: 'DD/MM/YYYY' } }],
    validation: validations.dateNaissance,
    label: 'Date de naissance',
    waitFor: true,
  },
  {
    id: 'categorie_socioprofessionnelle',
    type: 'select',
    selector: selectors.adherent.categorieSocioprofessionnelle,
    source: '{{lead.adherent.categorie_socioprofessionnelle}}',
    label: 'Categorie socioprofessionnelle',
  },
  {
    id: 'cadre_exercice',
    type: 'radio',
    selector: selectors.adherent.cadreExercice.primary,
    source: '{{lead.adherent.cadre_exercice}}',
    label: 'Cadre exercice',
    optional: true,
  },
  {
    id: 'regime_obligatoire',
    type: 'select',
    selector: selectors.adherent.regimeObligatoire,
    source: '{{lead.adherent.regime_obligatoire}}',
    label: 'Regime obligatoire',
  },
  {
    id: 'code_postal',
    type: 'text',
    selector: selectors.adherent.codePostal,
    source: '{{lead.adherent.code_postal}}',
    validation: validations.codePostal,
    label: 'Code postal',
  },
];

export const adherentStep: FormFillStep = {
  id: 'alptis-adherent',
  name: 'Informations Adherent',
  description: 'Section 2: Subscriber information fields (8 fields)',
  type: 'form-fill',
  timeout: config.timeouts.default,
  retry: { attempts: 2, delayMs: 500 },
  fields: adherentFields,
};

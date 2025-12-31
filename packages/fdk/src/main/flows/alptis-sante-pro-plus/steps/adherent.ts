/**
 * Adherent step (Section 2) for Alptis Sante Pro Plus
 * Includes: micro_entrepreneur, ville, statut_professionnel
 */
import type { FormFillStep, FieldDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';
import { validations } from '../transformer';

const s = selectors.adherent;
const dateTransform = [{ name: 'toDate', args: { format: 'DD/MM/YYYY' } }];

const adherentFields: FieldDefinition[] = [
  { id: 'civilite', type: 'select', selector: s.civilite, source: '{{lead.adherent.civilite}}', label: 'Civilite' },
  { id: 'nom', type: 'text', selector: s.nom, source: '{{lead.adherent.nom}}', label: 'Nom' },
  { id: 'prenom', type: 'text', selector: s.prenom, source: '{{lead.adherent.prenom}}', label: 'Prenom' },
  { id: 'dateNaissance', type: 'date', selector: s.dateNaissance, source: '{{lead.adherent.dateNaissance}}',
    transform: dateTransform, validation: validations.dateNaissance, label: 'Date de naissance', waitFor: true },
  { id: 'email', type: 'email', selector: s.email, source: '{{lead.adherent.email}}',
    validation: validations.email, label: 'Email' },
  { id: 'telephone', type: 'text', selector: s.telephone, source: '{{lead.adherent.telephone}}',
    validation: validations.telephone, label: 'Telephone' },
  { id: 'adresseRue', type: 'text', selector: s.adresseRue, source: '{{lead.adherent.adresse.rue}}', label: 'Adresse' },
  { id: 'codePostal', type: 'text', selector: s.codePostal, source: '{{lead.adherent.adresse.codePostal}}',
    validation: validations.codePostal, label: 'Code postal' },
  { id: 'ville', type: 'text', selector: s.ville, source: '{{lead.adherent.adresse.ville}}',
    validation: validations.ville, label: 'Ville' },
  { id: 'profession', type: 'select', selector: s.profession, source: '{{lead.adherent.profession}}', label: 'Profession' },
  { id: 'regime', type: 'select', selector: s.regime, source: '{{lead.adherent.regime}}',
    validation: validations.regime, label: 'Regime' },
  { id: 'statutProfessionnel', type: 'select', selector: s.statutProfessionnel,
    source: '{{lead.adherent.statut_professionnel}}', label: 'Statut professionnel' },
  { id: 'microEntrepreneur', type: 'checkbox', selector: s.microEntrepreneur,
    source: '{{lead.adherent.micro_entrepreneur}}', label: 'Micro-entrepreneur', optional: true },
];

export const adherentStep: FormFillStep = {
  id: 'alptis-adherent',
  name: 'Adherent',
  description: 'Fill Section 2 - Adherent information with TNS fields',
  type: 'form-fill',
  timeout: config.timeouts.default,
  retry: { attempts: 2, delayMs: 500 },
  fields: adherentFields,
  afterFill: [
    { action: 'click', selector: selectors.navigation.nextStep.value, waitAfter: 500 },
    { action: 'waitForNavigation', timeout: config.timeouts.navigation },
  ],
};

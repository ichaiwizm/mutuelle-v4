/**
 * Transformer configuration for Alptis Sante Pro Plus flow
 * TNS-only eligibility (no age check)
 */
import type { MapperConfig, FieldMapping, ValidationRule } from '@mutuelle/engine';
import type { RegimeSocial, StatutProfessionnel, SanteProPlusLeadData } from './types';

/** TNS-only eligibility check (no age restriction) */
export function checkEligibility(lead: SanteProPlusLeadData): boolean {
  const regime = lead.adherent?.regime;
  return regime === 'TNS';
}

/** Profession mapper */
export const professionMapper: Record<string, string> = {
  artisan: 'ARTISAN',
  commercant: 'COMMERCANT',
  liberal: 'PROFESSION_LIBERALE',
  agriculteur: 'AGRICULTEUR',
};

/** Regime mapper */
export const regimeMapper: Record<string, RegimeSocial> = {
  tns: 'TNS',
  salarie: 'SALARIE',
  autre: 'AUTRE',
};

/** Statut professionnel mapper */
export const statutProfessionnelMapper: Record<string, StatutProfessionnel> = {
  artisan: 'ARTISAN_COMMERCANT',
  commercant: 'ARTISAN_COMMERCANT',
  liberal: 'PROFESSIONS_LIBERALES',
};

export const validations: Record<string, ValidationRule[]> = {
  dateNaissance: [
    { type: 'required', message: 'Date de naissance requise' },
    { type: 'date', message: 'Format de date invalide' },
  ],
  email: [
    { type: 'required', message: 'Email requis' },
    { type: 'email', message: 'Format email invalide' },
  ],
  telephone: [
    { type: 'required', message: 'Telephone requis' },
    { type: 'phone', message: 'Format telephone invalide' },
  ],
  codePostal: [
    { type: 'required', message: 'Code postal requis' },
    { type: 'pattern', value: '^[0-9]{5}$', message: 'Code postal invalide' },
  ],
  ville: [
    { type: 'required', message: 'Ville requise' },
  ],
  regime: [
    { type: 'required', message: 'Regime requis' },
    { type: 'enum', value: ['TNS'], message: 'Seul le regime TNS est accepte' },
  ],
};

const adherentMappings: FieldMapping[] = [
  { from: 'adherent.dateNaissance', to: 'dateNaissance', transform: [{ name: 'toDate', args: { format: 'DD/MM/YYYY' } }] },
  { from: 'adherent.profession', to: 'profession' },
  { from: 'adherent.regime', to: 'regime' },
  { from: 'adherent.statut_professionnel', to: 'statutProfessionnel' },
  { from: 'adherent.micro_entrepreneur', to: 'microEntrepreneur', default: false },
  { from: 'adherent.adresse.ville', to: 'ville' },
  { from: 'adherent.adresse.codePostal', to: 'codePostal' },
];

const conjointMappings: FieldMapping[] = [
  { from: 'conjoint.dateNaissance', to: 'conjointDateNaissance', transform: [{ name: 'toDate', args: { format: 'DD/MM/YYYY' } }] },
  { from: 'conjoint.regime', to: 'conjointRegime', default: 'TNS' },
];

export const mappers: Record<string, MapperConfig> = {
  adherent: { name: 'adherent-mapper', mappings: adherentMappings, strict: true },
  conjoint: { name: 'conjoint-mapper', mappings: conjointMappings, strict: false },
};

export const transformerConfig = {
  eligibility: checkEligibility,
  validations,
  mappers,
  professionMapper,
  regimeMapper,
  statutProfessionnelMapper,
  sections: ['miseEnPlace', 'adherent', 'conjoint', 'enfants'] as const,
};

export type TransformerConfig = typeof transformerConfig;

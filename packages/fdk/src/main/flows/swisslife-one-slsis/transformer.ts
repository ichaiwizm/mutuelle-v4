/**
 * Transformer configuration for SwissLife One SLSIS flow
 * NO swap logic - direct data transformation
 */
import type { MapperConfig, FieldMapping, ValidationRule } from '@mutuelle/engine';
import { SwissLifeProfession, SwissLifeRegime, SwissLifeStatut, SwissLifeGamme, TypeSimulation } from './types';

// Validation rules
export const validations: Record<string, ValidationRule[]> = {
  dateNaissance: [
    { type: 'required', message: 'Date de naissance requise' },
    { type: 'date', message: 'Format de date invalide' },
  ],
  codePostal: [
    { type: 'required', message: 'Code postal requis' },
    { type: 'pattern', value: '^[0-9]{5}$', message: 'Code postal invalide' },
  ],
  dateEffet: [
    { type: 'required', message: 'Date effet requise' },
    { type: 'date', message: 'Format de date invalide' },
  ],
};

// Project name generation
export function generateProjectName(lead: { nom?: string; prenom?: string }): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `${lead.nom || 'SLSIS'}_${lead.prenom || 'Devis'}_${timestamp}`;
}

// Type simulation based on family structure
export function determineTypeSimulation(hasConjoint: boolean, hasEnfants: boolean): TypeSimulation {
  if (hasConjoint && hasEnfants) return TypeSimulation.FAMILLE;
  if (hasConjoint) return TypeSimulation.ASSURE_CONJOINT;
  if (hasEnfants) return TypeSimulation.ASSURE_ENFANTS;
  return TypeSimulation.ASSURE_SEUL;
}

// Mappers for enum values
export const professionMapper: Record<string, SwissLifeProfession> = {
  salarie: SwissLifeProfession.SALARIE,
  tns: SwissLifeProfession.TNS,
  sans_emploi: SwissLifeProfession.SANS_EMPLOI,
  retraite: SwissLifeProfession.RETRAITE,
  etudiant: SwissLifeProfession.ETUDIANT,
};

export const regimeMapper: Record<string, SwissLifeRegime> = {
  general: SwissLifeRegime.GENERAL,
  alsace_moselle: SwissLifeRegime.ALSACE_MOSELLE,
  tns: SwissLifeRegime.TNS,
};

export const statutMapper: Record<string, SwissLifeStatut> = {
  cadre: SwissLifeStatut.CADRE,
  non_cadre: SwissLifeStatut.NON_CADRE,
  commercant: SwissLifeStatut.TNS_COMMERCANT,
  artisan: SwissLifeStatut.TNS_ARTISAN,
  liberal: SwissLifeStatut.TNS_LIBERAL,
};

export const gammeMapper: Record<string, SwissLifeGamme> = {
  essentiel: SwissLifeGamme.ESSENTIEL,
  confort: SwissLifeGamme.CONFORT,
  equilibre: SwissLifeGamme.EQUILIBRE,
  excellence: SwissLifeGamme.EXCELLENCE,
};

// Field mappings
const projetMappings: FieldMapping[] = [
  { from: 'lead', to: 'nomProjet', transform: [{ name: 'generateProjectName', args: {} }] },
];

const assurePrincipalMappings: FieldMapping[] = [
  { from: 'adherent.dateNaissance', to: 'dateNaissance', transform: [{ name: 'toDate', args: { format: 'DD/MM/YYYY' } }] },
  { from: 'adherent.profession', to: 'profession' },
  { from: 'adherent.regime', to: 'regime' },
  { from: 'adherent.statut', to: 'statut' },
  { from: 'adherent.adresse.codePostal', to: 'codePostal' },
];

const conjointMappings: FieldMapping[] = [
  { from: 'conjoint.dateNaissance', to: 'dateNaissance', transform: [{ name: 'toDate', args: { format: 'DD/MM/YYYY' } }] },
  { from: 'conjoint.profession', to: 'profession' },
  { from: 'conjoint.regime', to: 'regime' },
  { from: 'conjoint.statut', to: 'statut' },
];

export const mappers: Record<string, MapperConfig> = {
  projet: { name: 'projet-mapper', mappings: projetMappings, strict: true },
  assurePrincipal: { name: 'assure-principal-mapper', mappings: assurePrincipalMappings, strict: true },
  conjoint: { name: 'conjoint-mapper', mappings: conjointMappings, strict: false },
};

export const transformerConfig = {
  validations,
  mappers,
  sections: ['projet', 'besoins', 'typeSimulation', 'assurePrincipal', 'conjoint', 'enfants', 'gammesOptions'] as const,
};

export type TransformerConfig = typeof transformerConfig;

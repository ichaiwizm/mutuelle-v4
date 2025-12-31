/**
 * Transformer configuration for Alptis Sante Select flow
 */
import type { MapperConfig, FieldMapping, ValidationRule } from '@mutuelle/engine';
import type { AlptisProfession, AlptisRegime, AlptisCadreExercice } from './types';

// Validation rules for lead data
export const validations: Record<string, ValidationRule[]> = {
  dateNaissance: [{ type: 'required', message: 'Date de naissance requise' }, { type: 'date', message: 'Format invalide' }],
  nom: [{ type: 'required', message: 'Nom requis' }],
  prenom: [{ type: 'required', message: 'Prenom requis' }],
  codePostal: [{ type: 'required', message: 'Code postal requis' }, { type: 'pattern', value: '^[0-9]{5}$', message: 'Code postal invalide' }],
  dateEffet: [{ type: 'required', message: 'Date effet requise' }, { type: 'date', message: 'Format invalide' }],
};

// Eligibility rules: age >= 60 OR TNS regime triggers swap
export const eligibilityRules = {
  isEligible: (age: number, regime: string): boolean => {
    if (age >= 60) return true;
    const r = regime.toLowerCase();
    return r.includes('tns') || r.includes('independant');
  },
  calculateAge: (dateNaissance: string): number => {
    const [d, m, y] = dateNaissance.split('/').map(Number);
    const birth = new Date(y, m - 1, d), today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < m - 1 || (today.getMonth() === m - 1 && today.getDate() < d)) age--;
    return age;
  },
};

// Profession mapper (11 types)
export const professionMapper: Record<string, AlptisProfession> = {
  'profession liberale': 'PROFESSIONS_LIBERALES_ET_ASSIMILES', "chef d'entreprise": 'CHEFS_D_ENTREPRISE',
  'commercant': 'COMMERCANTS_ET_ASSIMILES', 'artisan': 'ARTISANS', 'salarie': 'EMPLOYES_AGENTS_DE_MAITRISE',
  'retraite': 'RETRAITES', 'exploitant agricole': 'AGRICULTEURS_EXPLOITANTS',
  "en recherche d'emploi": 'PERSONNES_SANS_ACTIVITE_PROFESSIONNELLE', 'sans activite': 'PERSONNES_SANS_ACTIVITE_PROFESSIONNELLE',
  'cadre': 'CADRES', 'ouvrier': 'OUVRIERS', 'fonction publique': 'CADRES_ET_EMPLOYES_DE_LA_FONCTION_PUBLIQUE',
};

// Regime mapper (5 types)
export const regimeMapper: Record<string, AlptisRegime> = {
  'tns : regime des independants': 'SECURITE_SOCIALE_INDEPENDANTS', 'tns': 'SECURITE_SOCIALE_INDEPENDANTS',
  'independant': 'SECURITE_SOCIALE_INDEPENDANTS', 'regime des independants': 'SECURITE_SOCIALE_INDEPENDANTS',
  'salarie (ou retraite)': 'SECURITE_SOCIALE', 'salarie': 'SECURITE_SOCIALE', 'retraite': 'SECURITE_SOCIALE',
  'salarie exploitant agricole': 'REGIME_SALARIES_AGRICOLES', 'exploitant agricole': 'REGIME_SALARIES_AGRICOLES',
  'alsace': 'ALSACE_MOSELLE', 'moselle': 'ALSACE_MOSELLE', 'amexa': 'AMEXA',
};

// Civilite mapper
export const civiliteMapper: Record<string, 'monsieur' | 'madame'> = {
  'm': 'monsieur', 'mr': 'monsieur', 'monsieur': 'monsieur', 'homme': 'monsieur',
  'mme': 'madame', 'madame': 'madame', 'femme': 'madame', 'mlle': 'madame',
};

// Cadre exercice logic
const CADRE_PROFESSIONS: AlptisProfession[] = ['AGRICULTEURS_EXPLOITANTS', 'ARTISANS', 'CHEFS_D_ENTREPRISE', 'COMMERCANTS_ET_ASSIMILES', 'PROFESSIONS_LIBERALES_ET_ASSIMILES'];
export const cadreExerciceMapper = {
  professions: CADRE_PROFESSIONS,
  requiresCadre: (p: AlptisProfession) => CADRE_PROFESSIONS.includes(p),
  getCadre: (r: string): AlptisCadreExercice => r.toLowerCase().includes('tns') || r.toLowerCase().includes('independant') ? 'INDEPENDANT_PRESIDENT_SASU_SAS' : 'SALARIE',
};

// Section mappings
const profilMappings: FieldMapping[] = [
  { from: 'subscriber.civilite', to: 'adherent.civilite' }, { from: 'subscriber.nom', to: 'adherent.nom' },
  { from: 'subscriber.prenom', to: 'adherent.prenom' }, { from: 'subscriber.dateNaissance', to: 'adherent.date_naissance' },
  { from: 'subscriber.profession', to: 'adherent.categorie_socioprofessionnelle' },
  { from: 'subscriber.regimeSocial', to: 'adherent.regime_obligatoire' }, { from: 'subscriber.adresse.codePostal', to: 'adherent.code_postal' },
];
const conjointMappings: FieldMapping[] = [
  { from: 'project.conjoint.dateNaissance', to: 'conjoint.date_naissance' },
  { from: 'project.conjoint.profession', to: 'conjoint.categorie_socioprofessionnelle' },
  { from: 'project.conjoint.regimeSocial', to: 'conjoint.regime_obligatoire' },
];
const enfantsMappings: FieldMapping[] = [
  { from: 'project.enfants[].dateNaissance', to: 'enfants[].date_naissance' },
  { from: 'project.enfants[].regimeSocial', to: 'enfants[].regime_obligatoire' },
];

export const mappers: Record<string, MapperConfig> = {
  profil: { name: 'profil-mapper', mappings: profilMappings, strict: true },
  conjoint: { name: 'conjoint-mapper', mappings: conjointMappings, strict: false },
  enfants: { name: 'enfants-mapper', mappings: enfantsMappings, strict: false },
};

export const transformerConfig = {
  validations, mappers, eligibilityRules, professionMapper, regimeMapper, civiliteMapper, cadreExerciceMapper,
  sections: ['mise_en_place', 'adherent', 'conjoint', 'enfants'] as const,
};

export type TransformerConfig = typeof transformerConfig;

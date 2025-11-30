import type {
  LeadFormSchema,
  FieldDefinition,
  SectionDefinition,
} from "@/shared/types/form-schema";

/**
 * Section definitions for the simplified Lead form
 */
const SECTIONS: SectionDefinition[] = [
  {
    id: "subscriber",
    label: "Adhérent",
    description: "Informations de l'adhérent principal",
    icon: "User",
    order: 1,
    collapsible: false,
    defaultCollapsed: false,
  },
  {
    id: "project",
    label: "Projet",
    description: "Date d'effet du contrat",
    icon: "FileText",
    order: 2,
    collapsible: false,
    defaultCollapsed: false,
  },
  {
    id: "conjoint",
    label: "Conjoint",
    description: "Informations du conjoint",
    icon: "Users",
    order: 3,
    collapsible: true,
    defaultCollapsed: true,
    visible: {
      field: "project.conjoint",
      operator: "notEmpty",
    },
  },
  {
    id: "children",
    label: "Enfants",
    description: "Enfants à charge",
    icon: "Baby",
    order: 4,
    collapsible: true,
    defaultCollapsed: true,
    repeatable: true,
    minItems: 0,
    maxItems: 10,
    itemLabel: "Enfant {index}",
    visible: {
      field: "children",
      operator: "notEmpty",
    },
  },
];

/**
 * Common validation patterns
 */
const PATTERNS = {
  date: "^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/\\d{4}$",
  codePostal: "^\\d{5}$",
  nom: "^[a-zA-ZÀ-ÿ\\-\\s']+$",
};

/**
 * Profession options (aligned with Alptis mapper)
 */
const PROFESSION_OPTIONS = [
  { value: "profession libérale", label: "Profession libérale" },
  { value: "chef d'entreprise", label: "Chef d'entreprise" },
  { value: "commerçant", label: "Commerçant" },
  { value: "artisan", label: "Artisan" },
  { value: "salarié", label: "Salarié" },
  { value: "cadre", label: "Cadre" },
  { value: "ouvrier", label: "Ouvrier" },
  { value: "retraité", label: "Retraité" },
  { value: "fonction publique", label: "Fonction publique" },
  { value: "exploitant agricole", label: "Exploitant agricole" },
  { value: "en recherche d'emploi", label: "En recherche d'emploi" },
  { value: "sans activité", label: "Sans activité" },
  { value: "autre", label: "Autre" },
];

/**
 * Régime social options (aligned with Alptis mapper)
 */
const REGIME_SOCIAL_OPTIONS = [
  { value: "salarié", label: "Salarié" },
  { value: "salarié (ou retraité)", label: "Retraité (ex-salarié)" },
  { value: "tns : régime des indépendants", label: "TNS (Indépendant)" },
  { value: "alsace", label: "Alsace-Moselle" },
  { value: "exploitant agricole", label: "Exploitant agricole (MSA)" },
  { value: "amexa", label: "AMEXA" },
  { value: "autre", label: "Autre" },
];

/**
 * Simplified field definitions for the Lead form (12 fields max)
 */
const FIELDS: FieldDefinition[] = [
  // ========== SUBSCRIBER SECTION (7 fields) ==========
  {
    name: "civilite",
    path: "subscriber.civilite",
    label: "Civilité",
    type: "select",
    options: [
      { value: "M", label: "Monsieur" },
      { value: "Mme", label: "Madame" },
    ],
    required: true,
    section: "subscriber",
    order: 1,
  },
  {
    name: "nom",
    path: "subscriber.nom",
    label: "Nom",
    placeholder: "Dupont",
    type: "text",
    required: true,
    validations: [
      {
        type: "pattern",
        value: PATTERNS.nom,
        message: "Le nom ne peut contenir que des lettres, tirets et apostrophes",
      },
      {
        type: "minLength",
        value: 2,
        message: "Le nom doit contenir au moins 2 caractères",
      },
      {
        type: "maxLength",
        value: 50,
        message: "Le nom ne peut pas dépasser 50 caractères",
      },
    ],
    section: "subscriber",
    order: 2,
  },
  {
    name: "prenom",
    path: "subscriber.prenom",
    label: "Prénom",
    placeholder: "Jean",
    type: "text",
    required: true,
    validations: [
      {
        type: "pattern",
        value: PATTERNS.nom,
        message: "Le prénom ne peut contenir que des lettres, tirets et apostrophes",
      },
      {
        type: "minLength",
        value: 2,
        message: "Le prénom doit contenir au moins 2 caractères",
      },
    ],
    section: "subscriber",
    order: 3,
  },
  {
    name: "dateNaissance",
    path: "subscriber.dateNaissance",
    label: "Date de naissance",
    placeholder: "JJ/MM/AAAA",
    type: "date",
    required: true,
    pattern: PATTERNS.date,
    patternMessage: "Format attendu: JJ/MM/AAAA",
    helpText: "L'adhérent doit avoir entre 18 et 110 ans",
    section: "subscriber",
    order: 4,
  },
  {
    name: "codePostal",
    path: "subscriber.codePostal",
    label: "Code postal",
    placeholder: "75001",
    type: "text",
    required: true,
    pattern: PATTERNS.codePostal,
    patternMessage: "Le code postal doit contenir 5 chiffres",
    section: "subscriber",
    order: 5,
  },
  {
    name: "profession",
    path: "subscriber.profession",
    label: "Profession",
    type: "select",
    options: PROFESSION_OPTIONS,
    required: true,
    section: "subscriber",
    order: 6,
  },
  {
    name: "regimeSocial",
    path: "subscriber.regimeSocial",
    label: "Régime social",
    type: "select",
    options: REGIME_SOCIAL_OPTIONS,
    required: true,
    section: "subscriber",
    order: 7,
  },

  // ========== PROJECT SECTION (1 field) ==========
  {
    name: "dateEffet",
    path: "project.dateEffet",
    label: "Date d'effet souhaitée",
    placeholder: "JJ/MM/AAAA",
    type: "date",
    required: true,
    pattern: PATTERNS.date,
    patternMessage: "Format attendu: JJ/MM/AAAA",
    section: "project",
    order: 1,
  },

  // ========== CONJOINT SECTION (3 fields) ==========
  {
    name: "conjoint.dateNaissance",
    path: "project.conjoint.dateNaissance",
    label: "Date de naissance",
    placeholder: "JJ/MM/AAAA",
    type: "date",
    required: {
      field: "project.conjoint",
      operator: "notEmpty",
    },
    pattern: PATTERNS.date,
    patternMessage: "Format attendu: JJ/MM/AAAA",
    helpText: "Le conjoint doit avoir entre 16 et 110 ans",
    section: "conjoint",
    order: 1,
  },
  {
    name: "conjoint.profession",
    path: "project.conjoint.profession",
    label: "Profession",
    type: "select",
    options: PROFESSION_OPTIONS,
    required: false,
    section: "conjoint",
    order: 2,
  },
  {
    name: "conjoint.regimeSocial",
    path: "project.conjoint.regimeSocial",
    label: "Régime social",
    type: "select",
    options: REGIME_SOCIAL_OPTIONS,
    required: false,
    section: "conjoint",
    order: 3,
  },

  // ========== CHILDREN SECTION (1 field per child) ==========
  {
    name: "children[].dateNaissance",
    path: "children[].dateNaissance",
    label: "Date de naissance",
    placeholder: "JJ/MM/AAAA",
    type: "date",
    required: true,
    pattern: PATTERNS.date,
    patternMessage: "Format attendu: JJ/MM/AAAA",
    helpText: "L'enfant doit avoir entre 0 et 27 ans",
    section: "children",
    order: 1,
  },
];

/**
 * Complete simplified Lead Form Schema
 */
export const LEAD_FORM_SCHEMA: LeadFormSchema = {
  version: "2.0.0",
  sections: SECTIONS,
  fields: FIELDS,
  computedFields: [
    { type: "age", sourceField: "subscriber.dateNaissance" },
    { type: "age", sourceField: "project.conjoint.dateNaissance" },
  ],
};

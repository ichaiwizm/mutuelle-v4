/**
 * Conjoint section field definitions
 */

import type { FieldDefinition } from "@/shared/types/form-schema";
import { VALIDATION_PATTERNS } from "../patterns";
import { PROFESSION_OPTIONS, REGIME_SOCIAL_OPTIONS } from "../options";

export const CONJOINT_FIELDS: FieldDefinition[] = [
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
    pattern: VALIDATION_PATTERNS.date,
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
    label: "Regime social",
    type: "select",
    options: REGIME_SOCIAL_OPTIONS,
    required: false,
    section: "conjoint",
    order: 3,
  },
];

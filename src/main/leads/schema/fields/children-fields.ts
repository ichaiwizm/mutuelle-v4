/**
 * Children section field definitions
 */

import type { FieldDefinition } from "@/shared/types/form-schema";
import { VALIDATION_PATTERNS } from "../patterns";

export const CHILDREN_FIELDS: FieldDefinition[] = [
  {
    name: "children[].dateNaissance",
    path: "children[].dateNaissance",
    label: "Date de naissance",
    placeholder: "JJ/MM/AAAA",
    type: "date",
    required: true,
    pattern: VALIDATION_PATTERNS.date,
    patternMessage: "Format attendu: JJ/MM/AAAA",
    helpText: "L'enfant doit avoir entre 0 et 27 ans",
    section: "children",
    order: 1,
  },
];

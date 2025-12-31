/**
 * Project section field definitions
 */

import type { FieldDefinition } from "@/shared/types/form-schema";
import { VALIDATION_PATTERNS } from "../patterns";

export const PROJECT_FIELDS: FieldDefinition[] = [
  {
    name: "dateEffet",
    path: "project.dateEffet",
    label: "Date d'effet souhaitee",
    placeholder: "JJ/MM/AAAA",
    type: "date",
    required: true,
    pattern: VALIDATION_PATTERNS.date,
    patternMessage: "Format attendu: JJ/MM/AAAA",
    section: "project",
    order: 1,
  },
];

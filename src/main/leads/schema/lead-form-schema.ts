/**
 * Complete simplified Lead Form Schema
 */

import type { LeadFormSchema } from "@/shared/types/form-schema";
import { SECTIONS } from "./sections";
import {
  SUBSCRIBER_FIELDS,
  PROJECT_FIELDS,
  CONJOINT_FIELDS,
  CHILDREN_FIELDS,
} from "./fields";

const FIELDS = [
  ...SUBSCRIBER_FIELDS,
  ...PROJECT_FIELDS,
  ...CONJOINT_FIELDS,
  ...CHILDREN_FIELDS,
];

export const LEAD_FORM_SCHEMA: LeadFormSchema = {
  version: "2.0.0",
  sections: SECTIONS,
  fields: FIELDS,
  computedFields: [
    { type: "age", sourceField: "subscriber.dateNaissance" },
    { type: "age", sourceField: "project.conjoint.dateNaissance" },
  ],
};

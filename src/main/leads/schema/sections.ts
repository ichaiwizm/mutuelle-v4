/**
 * Section definitions for the Lead form
 */

import type { SectionDefinition } from "@/shared/types/form-schema";

export const SECTIONS: SectionDefinition[] = [
  {
    id: "subscriber",
    label: "Adherent",
    description: "Informations de l'adherent principal",
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
    description: "Enfants a charge",
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

/**
 * Subscriber section field definitions
 */

import type { FieldDefinition } from "@/shared/types/form-schema";
import { VALIDATION_PATTERNS } from "../patterns";
import { PROFESSION_OPTIONS, REGIME_SOCIAL_OPTIONS, CIVILITE_OPTIONS } from "../options";

export const SUBSCRIBER_FIELDS: FieldDefinition[] = [
  {
    name: "civilite",
    path: "subscriber.civilite",
    label: "Civilite",
    type: "select",
    options: CIVILITE_OPTIONS,
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
      { type: "pattern", value: VALIDATION_PATTERNS.nom, message: "Le nom ne peut contenir que des lettres, tirets et apostrophes" },
      { type: "minLength", value: 2, message: "Le nom doit contenir au moins 2 caracteres" },
      { type: "maxLength", value: 50, message: "Le nom ne peut pas depasser 50 caracteres" },
    ],
    section: "subscriber",
    order: 2,
  },
  {
    name: "prenom",
    path: "subscriber.prenom",
    label: "Prenom",
    placeholder: "Jean",
    type: "text",
    required: true,
    validations: [
      { type: "pattern", value: VALIDATION_PATTERNS.nom, message: "Le prenom ne peut contenir que des lettres, tirets et apostrophes" },
      { type: "minLength", value: 2, message: "Le prenom doit contenir au moins 2 caracteres" },
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
    pattern: VALIDATION_PATTERNS.date,
    patternMessage: "Format attendu: JJ/MM/AAAA",
    helpText: "L'adherent doit avoir entre 18 et 110 ans",
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
    pattern: VALIDATION_PATTERNS.codePostal,
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
    label: "Regime social",
    type: "select",
    options: REGIME_SOCIAL_OPTIONS,
    required: true,
    section: "subscriber",
    order: 7,
  },
];

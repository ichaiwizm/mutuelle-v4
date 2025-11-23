/**
 * Alptis Santé Select Product Configuration
 * Mutuelle santé individuelle
 */

import type { ProductConfiguration } from "../../../../shared/types/product";

export const ALPTIS_SANTE_SELECT: ProductConfiguration = {
  platform: "alptis",
  product: "sante_select",
  flowKey: "alptis_sante_select",
  category: "sante",
  displayName: "Alptis Santé Select",
  description: "Mutuelle santé individuelle Alptis",

  steps: [
    {
      id: "auth",
      name: "Authentification",
      description: "Connexion à la plateforme Alptis",
      type: "auth",
      required: true,
      method: "login",
      estimatedDuration: 5000,
    },
    {
      id: "navigation",
      name: "Navigation",
      description: "Accès au formulaire Santé Select",
      type: "navigation",
      required: true,
      method: "execute",
      estimatedDuration: 3000,
    },
    {
      id: "form-section-1",
      name: "Mise en place",
      description: "Section 1 : Mise en place du contrat (3 champs)",
      type: "form-fill",
      required: true,
      method: "fillMiseEnPlace",
      estimatedDuration: 2000,
    },
    {
      id: "form-section-2",
      name: "Adhérent",
      description: "Section 2 : Informations de l'adhérent (8 champs)",
      type: "form-fill",
      required: true,
      method: "fillAdherent",
      estimatedDuration: 5000,
    },
    {
      id: "form-section-3",
      name: "Conjoint",
      description: "Section 3 : Informations du conjoint (4 champs, conditionnelle)",
      type: "form-fill",
      required: false,
      conditional: "hasConjoint",
      method: "fillConjoint",
      estimatedDuration: 3000,
    },
    {
      id: "form-section-4",
      name: "Enfants",
      description: "Section 4 : Informations des enfants (2 champs par enfant, conditionnelle)",
      type: "form-fill",
      required: false,
      conditional: "hasEnfants",
      method: "fillEnfants",
      estimatedDuration: 4000,
    },
  ],

  metadata: {
    formUrl: "https://pro.alptis.org/sante-select/informations-projet/",
    totalSections: 4,
    supportsPartialFill: true,
  },
};

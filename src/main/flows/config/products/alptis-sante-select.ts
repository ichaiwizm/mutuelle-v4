/**
 * Alptis Santé Select Product Configuration
 * Mutuelle santé individuelle
 */

import type { ProductConfiguration } from "../../../../shared/types/product";
import type { AlptisFormData } from "../../platforms/alptis/products/sante-select/transformers/types";

export const ALPTIS_SANTE_SELECT: ProductConfiguration<AlptisFormData> = {
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
      stepClass: "AlptisAuthStep",
      needsCredentials: false, // Credentials are now loaded via services.auth
      needsLead: false,
      maxRetries: 2,
      estimatedDuration: 5000,
    },
    {
      id: "navigation",
      name: "Navigation",
      description: "Accès au formulaire Santé Select",
      type: "navigation",
      required: true,
      method: "execute",
      stepClass: "AlptisNavigationStep",
      needsCredentials: false,
      needsLead: false,
      maxRetries: 1,
      estimatedDuration: 3000,
    },
    {
      id: "form-section-1",
      name: "Mise en place",
      description: "Section 1 : Mise en place du contrat (3 champs)",
      type: "form-fill",
      required: true,
      method: "fillMiseEnPlace",
      stepClass: "AlptisFormFillStep",
      needsLead: true,
      needsCredentials: false,
      maxRetries: 1,
      estimatedDuration: 2000,
    },
    {
      id: "form-section-2",
      name: "Adhérent",
      description: "Section 2 : Informations de l'adhérent (8 champs)",
      type: "form-fill",
      required: true,
      method: "fillAdherent",
      stepClass: "AlptisFormFillStep",
      needsLead: true,
      needsCredentials: false,
      maxRetries: 1,
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
      stepClass: "AlptisFormFillStep",
      needsLead: true,
      needsCredentials: false,
      maxRetries: 1,
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
      stepClass: "AlptisFormFillStep",
      needsLead: true,
      needsCredentials: false,
      maxRetries: 1,
      estimatedDuration: 4000,
    },
    {
      id: "submit",
      name: "Soumettre",
      description: "Cliquer sur Garanties pour passer à l'étape 2",
      type: "form-fill",
      required: true,
      method: "submit",
      stepClass: "AlptisFormFillStep",
      needsLead: false,
      needsCredentials: false,
      maxRetries: 1,
      estimatedDuration: 3000,
    },
    {
      id: "save-garanties",
      name: "Enregistrer",
      description: "Cliquer sur Enregistrer sur la page Garanties",
      type: "form-fill",
      required: true,
      method: "saveGaranties",
      stepClass: "AlptisFormFillStep",
      needsLead: false,
      needsCredentials: false,
      maxRetries: 1,
      estimatedDuration: 2000,
    },
    {
      id: "confirm-save",
      name: "Confirmer",
      description: "Cliquer sur 'Enregistrer et continuer' dans le modal de confirmation",
      type: "form-fill",
      required: true,
      method: "confirmSave",
      stepClass: "AlptisFormFillStep",
      needsLead: false,
      needsCredentials: false,
      maxRetries: 1,
      estimatedDuration: 2000,
      isSubmit: true,
    },
    {
      id: "devis-capture",
      name: "Capture Devis",
      description: "Extraire les données du devis (prix, référence, URL) depuis la page résultat",
      type: "devis-capture",
      required: true,
      method: "captureDevis",
      stepClass: "AlptisDevisCaptureStep",
      needsLead: true,
      needsCredentials: false,
      maxRetries: 2,
      estimatedDuration: 5000,
    },
  ],

  // Conditional rules to evaluate step conditions
  conditionalRules: {
    hasConjoint: (data: AlptisFormData) => !!data.conjoint,
    hasEnfants: (data: AlptisFormData) => (data.enfants?.length ?? 0) > 0,
  },

  metadata: {
    // Basic info
    formUrl: "https://pro.alptis.org/sante-select/informations-projet/",
    totalSections: 4,
    supportsPartialFill: true,

    // Technical capabilities
    requiresBrowser: true,           // Requires Playwright browser automation
    supportsScreenshots: true,       // Can capture screenshots during execution
    supportsPauseResume: true,       // Supports pause/resume with state persistence

    // Tags & categorization
    tags: ["sante", "famille", "mutuelle", "alptis"],
    complexity: "medium",            // 6 steps with 2 conditional branches
    priority: "high",                // High priority product
  },
};

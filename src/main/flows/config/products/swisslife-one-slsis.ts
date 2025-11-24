/**
 * SwissLife One SLSIS Product Configuration
 * Santé collective SwissLife One
 */

import type { ProductConfiguration } from "../../../../shared/types/product";
import type { SwissLifeOneFormData } from "../../platforms/swisslifeone/products/slsis/transformers/types";

export const SWISSLIFE_ONE_SLSIS: ProductConfiguration<SwissLifeOneFormData> = {
  platform: "swisslife",
  product: "slsis",
  flowKey: "swisslife_one_slis",
  category: "sante",
  displayName: "SwissLife One SLSIS",
  description: "Santé collective SwissLife One",

  steps: [
    {
      id: "auth",
      name: "Authentification",
      description: "Connexion à SwissLife One (ADFS/SAML)",
      type: "auth",
      required: true,
      method: "login",
      stepClass: "SwissLifeAuthStep",
      needsCredentials: true,
      needsLead: false,
      maxRetries: 2,
      estimatedDuration: 10000,
    },
    {
      id: "navigation",
      name: "Navigation",
      description: "Accès au formulaire SLSIS (iframe loading ~45s)",
      type: "navigation",
      required: true,
      method: "execute",
      stepClass: "SwissLifeNavigationStep",
      needsCredentials: false,
      needsLead: false,
      maxRetries: 1,
      estimatedDuration: 45000,
    },
    {
      id: "form-step1-section1",
      name: "Nom du projet",
      description: "Step 1 Section 1 : Nom du projet (1 champ)",
      type: "form-fill",
      required: true,
      method: "fillStep1Section1",
      stepClass: "SwissLifeFormFillStep",
      needsLead: true,
      needsCredentials: false,
      maxRetries: 1,
      estimatedDuration: 1000,
    },
    {
      id: "form-step1-section2",
      name: "Besoins",
      description: "Step 1 Section 2 : Besoins (2 champs)",
      type: "form-fill",
      required: true,
      method: "fillStep1Section2",
      stepClass: "SwissLifeFormFillStep",
      needsLead: true,
      needsCredentials: false,
      maxRetries: 1,
      estimatedDuration: 2000,
    },
    {
      id: "form-step1-section3",
      name: "Type de simulation",
      description: "Step 1 Section 3 : Type de simulation (1 champ)",
      type: "form-fill",
      required: true,
      method: "fillStep1Section3",
      stepClass: "SwissLifeFormFillStep",
      needsLead: true,
      needsCredentials: false,
      maxRetries: 1,
      estimatedDuration: 1000,
    },
    {
      id: "form-step1-section4",
      name: "Assuré principal",
      description: "Step 1 Section 4 : Informations assuré principal (5 champs)",
      type: "form-fill",
      required: true,
      method: "fillStep1Section4",
      stepClass: "SwissLifeFormFillStep",
      needsLead: true,
      needsCredentials: false,
      maxRetries: 1,
      estimatedDuration: 4000,
    },
    {
      id: "form-step1-section5",
      name: "Conjoint",
      description: "Step 1 Section 5 : Informations conjoint (conditionnelle)",
      type: "form-fill",
      required: false,
      conditional: "hasConjoint",
      method: "fillStep1Section5",
      stepClass: "SwissLifeFormFillStep",
      needsLead: true,
      needsCredentials: false,
      maxRetries: 1,
      estimatedDuration: 3000,
    },
    {
      id: "form-step1-section6",
      name: "Enfants",
      description: "Step 1 Section 6 : Informations enfants (conditionnelle)",
      type: "form-fill",
      required: false,
      conditional: "hasEnfants",
      method: "fillStep1Section6",
      stepClass: "SwissLifeFormFillStep",
      needsLead: true,
      needsCredentials: false,
      maxRetries: 1,
      estimatedDuration: 4000,
    },
    {
      id: "form-step1-section7",
      name: "Gammes et Options",
      description: "Step 1 Section 7 : Sélection gammes et options (5 champs)",
      type: "form-fill",
      required: true,
      method: "fillStep1Section7",
      stepClass: "SwissLifeFormFillStep",
      needsLead: true,
      needsCredentials: false,
      maxRetries: 1,
      estimatedDuration: 3000,
    },
  ],

  // Conditional rules to evaluate step conditions
  conditionalRules: {
    hasConjoint: (data: SwissLifeOneFormData) => !!data.conjoint,
    hasEnfants: (data: SwissLifeOneFormData) => (data.enfants?.nombre_enfants ?? 0) > 0,
  },

  metadata: {
    // Basic info
    formUrl: "https://swisslife-one.fr/slsis",
    totalSections: 7,
    supportsPartialFill: true,

    // Technical capabilities
    requiresBrowser: true,           // Requires Playwright browser automation
    supportsScreenshots: true,       // Can capture screenshots during execution
    supportsPauseResume: false,      // Pause/resume not yet implemented

    // Tags & categorization
    tags: ["sante", "collectif", "famille", "swisslife"],
    complexity: "complex",           // 9 steps with iframe, long load times, 2 conditional branches
    priority: "high",                // High priority product
  },
};

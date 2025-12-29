/**
 * Static product data for renderer access
 * This is a frontend-friendly version of product configurations
 * without the conditionalRules functions that cannot be serialized
 */

import type { StepType, ProductCategory } from "../types/product";

export type StepInfo = {
  id: string;
  name: string;
  description?: string;
  type: StepType;
  required: boolean;
  conditional?: string;
  estimatedDuration?: number;
};

export type ProductInfo = {
  flowKey: string;
  platform: "alptis" | "swisslife" | "entoria";
  product: string;
  displayName: string;
  description?: string;
  category: ProductCategory;
  steps: StepInfo[];
  metadata?: {
    complexity?: "simple" | "medium" | "complex";
    tags?: string[];
  };
};

export const PRODUCTS: ProductInfo[] = [
  {
    flowKey: "alptis_sante_pro_plus",
    platform: "alptis",
    product: "sante_pro_plus",
    displayName: "Alptis Santé Pro Plus",
    description: "Mutuelle santé pour travailleurs non salariés (TNS)",
    category: "sante",
    steps: [
      {
        id: "auth",
        name: "Authentification",
        description: "Connexion à la plateforme Alptis",
        type: "auth",
        required: true,
        estimatedDuration: 5000,
      },
      {
        id: "navigation",
        name: "Navigation",
        description: "Accès au formulaire Santé Pro Plus",
        type: "navigation",
        required: true,
        estimatedDuration: 3000,
      },
      {
        id: "form-section-1",
        name: "Mise en place",
        description: "Section 1 : Mise en place du contrat",
        type: "form-fill",
        required: true,
        estimatedDuration: 2000,
      },
      {
        id: "form-section-2",
        name: "Adhérent",
        description: "Section 2 : Informations de l'adhérent",
        type: "form-fill",
        required: true,
        estimatedDuration: 6000,
      },
      {
        id: "form-section-3",
        name: "Conjoint",
        description: "Section 3 : Informations du conjoint",
        type: "form-fill",
        required: false,
        conditional: "hasConjoint",
        estimatedDuration: 3000,
      },
      {
        id: "form-section-4",
        name: "Enfants",
        description: "Section 4 : Informations des enfants",
        type: "form-fill",
        required: false,
        conditional: "hasEnfants",
        estimatedDuration: 4000,
      },
      {
        id: "submit",
        name: "Soumettre",
        description: "Passer à l'étape Garanties",
        type: "form-fill",
        required: true,
        estimatedDuration: 3000,
      },
    ],
    metadata: {
      complexity: "medium",
      tags: ["sante", "tns", "independant", "mutuelle"],
    },
  },
  {
    flowKey: "alptis_sante_select",
    platform: "alptis",
    product: "sante_select",
    displayName: "Alptis Santé Select",
    description: "Mutuelle santé individuelle Alptis",
    category: "sante",
    steps: [
      {
        id: "auth",
        name: "Authentification",
        description: "Connexion à la plateforme Alptis",
        type: "auth",
        required: true,
        estimatedDuration: 5000,
      },
      {
        id: "navigation",
        name: "Navigation",
        description: "Accès au formulaire Santé Select",
        type: "navigation",
        required: true,
        estimatedDuration: 3000,
      },
      {
        id: "form-section-1",
        name: "Mise en place",
        description: "Section 1 : Mise en place du contrat",
        type: "form-fill",
        required: true,
        estimatedDuration: 2000,
      },
      {
        id: "form-section-2",
        name: "Adhérent",
        description: "Section 2 : Informations de l'adhérent",
        type: "form-fill",
        required: true,
        estimatedDuration: 5000,
      },
      {
        id: "form-section-3",
        name: "Conjoint",
        description: "Section 3 : Informations du conjoint",
        type: "form-fill",
        required: false,
        conditional: "hasConjoint",
        estimatedDuration: 3000,
      },
      {
        id: "form-section-4",
        name: "Enfants",
        description: "Section 4 : Informations des enfants",
        type: "form-fill",
        required: false,
        conditional: "hasEnfants",
        estimatedDuration: 4000,
      },
      {
        id: "submit",
        name: "Soumettre",
        description: "Passer à l'étape Garanties",
        type: "form-fill",
        required: true,
        estimatedDuration: 3000,
      },
    ],
    metadata: {
      complexity: "medium",
      tags: ["sante", "famille", "mutuelle"],
    },
  },
  {
    flowKey: "swisslife_one_slsis",
    platform: "swisslife",
    product: "slsis",
    displayName: "SwissLife One SLSIS",
    description: "Santé collective SwissLife One",
    category: "sante",
    steps: [
      {
        id: "auth",
        name: "Authentification",
        description: "Connexion à SwissLife One (ADFS/SAML)",
        type: "auth",
        required: true,
        estimatedDuration: 10000,
      },
      {
        id: "navigation",
        name: "Navigation",
        description: "Accès au formulaire SLSIS",
        type: "navigation",
        required: true,
        estimatedDuration: 45000,
      },
      {
        id: "form-step1-section1",
        name: "Nom du projet",
        description: "Step 1 Section 1 : Nom du projet",
        type: "form-fill",
        required: true,
        estimatedDuration: 1000,
      },
      {
        id: "form-step1-section2",
        name: "Besoins",
        description: "Step 1 Section 2 : Besoins",
        type: "form-fill",
        required: true,
        estimatedDuration: 2000,
      },
      {
        id: "form-step1-section3",
        name: "Type de simulation",
        description: "Step 1 Section 3 : Type de simulation",
        type: "form-fill",
        required: true,
        estimatedDuration: 1000,
      },
      {
        id: "form-step1-section4",
        name: "Assuré principal",
        description: "Step 1 Section 4 : Informations assuré principal",
        type: "form-fill",
        required: true,
        estimatedDuration: 4000,
      },
      {
        id: "form-step1-section5",
        name: "Conjoint",
        description: "Step 1 Section 5 : Informations conjoint",
        type: "form-fill",
        required: false,
        conditional: "hasConjoint",
        estimatedDuration: 3000,
      },
      {
        id: "form-step1-section6",
        name: "Enfants",
        description: "Step 1 Section 6 : Informations enfants",
        type: "form-fill",
        required: false,
        conditional: "hasEnfants",
        estimatedDuration: 4000,
      },
      {
        id: "form-step1-section7",
        name: "Gammes et Options",
        description: "Step 1 Section 7 : Sélection gammes et options",
        type: "form-fill",
        required: true,
        estimatedDuration: 3000,
      },
      {
        id: "submit-step1",
        name: "Soumettre Step 1",
        description: "Passer à l'étape 2 (Garanties)",
        type: "form-fill",
        required: true,
        estimatedDuration: 5000,
      },
    ],
    metadata: {
      complexity: "complex",
      tags: ["sante", "collectif", "famille"],
    },
  },
  {
    flowKey: "entoria_pack_famille",
    platform: "entoria",
    product: "pack_famille",
    displayName: "Entoria Pack Famille",
    description: "Tarification TNS Santé avec option famille",
    category: "sante",
    steps: [
      {
        id: "auth",
        name: "Authentification",
        description: "Connexion à la plateforme Entoria",
        type: "auth",
        required: true,
        estimatedDuration: 5000,
      },
      {
        id: "navigation",
        name: "Navigation",
        description: "Accès au formulaire TNS Santé",
        type: "navigation",
        required: true,
        estimatedDuration: 3000,
      },
      {
        id: "step1-profil",
        name: "Profil",
        description: "Étape 1 : Profil de l'entrepreneur",
        type: "form-fill",
        required: true,
        estimatedDuration: 5000,
      },
      {
        id: "step1-submit",
        name: "Valider Profil",
        description: "Cliquer sur CONTINUER",
        type: "form-fill",
        required: true,
        estimatedDuration: 2000,
      },
      {
        id: "step2-besoin",
        name: "Besoin",
        description: "Étape 2 : Recueil des besoins",
        type: "form-fill",
        required: true,
        estimatedDuration: 2000,
      },
      {
        id: "step2-submit",
        name: "Valider Besoin",
        description: "Cliquer sur suivant",
        type: "form-fill",
        required: true,
        estimatedDuration: 2000,
      },
      {
        id: "step3-garanties",
        name: "Garanties",
        description: "Étape 3 : Choix des garanties",
        type: "form-fill",
        required: true,
        estimatedDuration: 5000,
      },
    ],
    metadata: {
      complexity: "simple",
      tags: ["sante", "tns", "famille", "mutuelle", "entoria", "tarification"],
    },
  },
];

export function getProductByFlowKey(flowKey: string): ProductInfo | undefined {
  return PRODUCTS.find((p) => p.flowKey === flowKey);
}

export function getProductsByPlatform(platform: "alptis" | "swisslife" | "entoria"): ProductInfo[] {
  return PRODUCTS.filter((p) => p.platform === platform);
}

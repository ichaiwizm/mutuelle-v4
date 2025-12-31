import type { ProductConfiguration, ProductCategory } from "@/shared/types/product";

export const swisslife_one_slsis: ProductConfiguration = {
  platform: "swisslife",
  product: "slsis",
  flowKey: "swisslife_one_slsis",
  category: "sante" as ProductCategory,
  displayName: "SwissLife One SLSIS",
  description: "Sante Individuelle et Confort Hospitalisation",
  steps: [
    { id: "auth", name: "Authentification", type: "auth", required: true, method: "auth" },
    { id: "navigation", name: "Navigation", type: "navigation", required: true, method: "navigate" },
    { id: "type-simulation", name: "Type Simulation", type: "form-fill", required: true, method: "fillTypeSimulation" },
    { id: "projet", name: "Projet", type: "form-fill", required: true, method: "fillProjet" },
    { id: "besoins", name: "Besoins", type: "form-fill", required: true, method: "fillBesoins" },
    { id: "assure-principal", name: "Assure Principal", type: "form-fill", required: true, method: "fillAssurePrincipal" },
    { id: "conjoint", name: "Conjoint", type: "form-fill", required: false, method: "fillConjoint", conditional: "hasConjoint" },
    { id: "enfants", name: "Enfants", type: "form-fill", required: false, method: "fillEnfants", conditional: "hasEnfants" },
    { id: "gammes-options", name: "Gammes Options", type: "form-fill", required: true, method: "fillGammesOptions" },
    { id: "submit", name: "Soumission", type: "submission", required: true, method: "submit", isSubmit: true },
  ],
  metadata: {
    formUrl: "https://www.swisslifeone.fr/index-swisslifeOne.html#/tarification-et-simulation/slsis",
    totalSections: 8,
    supportsPartialFill: false,
  },
};

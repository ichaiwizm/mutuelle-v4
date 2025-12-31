import type { ProductConfiguration, ProductCategory } from "@/shared/types/product";

export const entoria_pack_famille: ProductConfiguration = {
  platform: "entoria",
  product: "pack_famille",
  flowKey: "entoria_pack_famille",
  category: "sante" as ProductCategory,
  displayName: "Entoria Pack Famille",
  description: "Mutuelle famille Entoria",
  steps: [
    { id: "auth", name: "Authentification", type: "auth", required: true, method: "auth" },
    { id: "navigation", name: "Navigation", type: "navigation", required: true, method: "navigate" },
    { id: "besoin", name: "Besoin", type: "form-fill", required: true, method: "fillBesoin" },
    { id: "profil", name: "Profil", type: "form-fill", required: true, method: "fillProfil" },
    { id: "garanties", name: "Garanties", type: "form-fill", required: true, method: "fillGaranties" },
    { id: "submit", name: "Soumission", type: "submission", required: true, method: "submit", isSubmit: true },
  ],
  metadata: {
    formUrl: "https://espace-partenaires.entoria.fr/",
    totalSections: 5,
    supportsPartialFill: false,
  },
};

import type { ProductConfiguration, ProductCategory } from "@/shared/types/product";

export const alptis_sante_pro_plus: ProductConfiguration = {
  platform: "alptis",
  product: "sante_pro_plus",
  flowKey: "alptis_sante_pro_plus",
  category: "sante" as ProductCategory,
  displayName: "Alptis Sante Pro Plus",
  description: "Mutuelle sante professionnels",
  steps: [
    { id: "auth", name: "Authentification", type: "auth", required: true, method: "auth" },
    { id: "navigation", name: "Navigation", type: "navigation", required: true, method: "navigate" },
    { id: "mise-en-place", name: "Mise en place", type: "form-fill", required: true, method: "fillMiseEnPlace" },
    { id: "adherent", name: "Adherent", type: "form-fill", required: true, method: "fillAdherent" },
    { id: "conjoint", name: "Conjoint", type: "form-fill", required: false, method: "fillConjoint", conditional: "hasConjoint" },
    { id: "enfants", name: "Enfants", type: "form-fill", required: false, method: "fillEnfants", conditional: "hasEnfants" },
    { id: "submit", name: "Soumission", type: "submission", required: true, method: "submit", isSubmit: true },
  ],
  metadata: {
    formUrl: "https://pro.alptis.org/sante-pro-plus/informations-projet/",
    totalSections: 6,
    supportsPartialFill: true,
  },
};

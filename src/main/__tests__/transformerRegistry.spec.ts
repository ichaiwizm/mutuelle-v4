import { describe, it, expect } from "vitest";
import {
  getTransformerForFlow,
  transformLeadForFlow,
  hasTransformerForFlow,
} from "../flows/transformers";
import { parseLead } from "../leads/parsing/parser";
import type { AlptisFormData } from "../flows/platforms/alptis/products/sante-select/transformers/types";

describe("Transformer Registry", () => {
  describe("getTransformerForFlow", () => {
    it("returns transformer for exact flow key", () => {
      expect(getTransformerForFlow("alptis_sante_select")).toBeDefined();
      expect(getTransformerForFlow("swisslife_one_slsis")).toBeDefined();
    });

    it("returns transformer for prefix match", () => {
      // Simulates versioned flow keys
      expect(getTransformerForFlow("alptis_sante_select_v2")).toBeDefined();
    });

    it("returns undefined for unknown flow", () => {
      expect(getTransformerForFlow("unknown_flow")).toBeUndefined();
    });
  });

  describe("hasTransformerForFlow", () => {
    it("returns true for registered flows", () => {
      expect(hasTransformerForFlow("alptis_sante_select")).toBe(true);
      expect(hasTransformerForFlow("swisslife_one_slsis")).toBe(true);
    });

    it("returns false for unknown flows", () => {
      expect(hasTransformerForFlow("unknown_flow")).toBe(false);
    });
  });

  describe("transformLeadForFlow", () => {
    it("throws error for unknown flow", () => {
      const mockLead = { id: "test", subscriber: {} };
      expect(() => transformLeadForFlow("unknown_flow", mockLead)).toThrow(
        "No transformer found for flow: unknown_flow"
      );
    });
  });
});

describe("Assurland Lead → Alptis Transformation", () => {
  // Sample Assurland text format (must be > 500 chars to pass validation)
  const assurlandTextSample = `Civilite\tMONSIEUR
Nom\tDUPONT
Prenom\tJEAN
v4\t10 RUE DE LA PAIX RESIDENCE LES JARDINS BATIMENT A APPARTEMENT 123
Code postal\t75001
Ville\tPARIS
Telephone portable\t0612345678
Telephone domicile\t0145678901
Email\tjean.dupont@example.com
Date de naissance\t15/03/1980
Age\t43 ans
Sexe\tMasculin
Profession\tProfession libérale
regime social\tTravailleurs Non Salariés
Situation familiale\tMarié
Nombre d'enfants\t2
Date de naissance enfants min\t01/09/2010
Date de naissance enfants max\t15/04/2015
Date de naissance Conjoint\t20/06/1982
Regime Social Conjoint\tSalarié du régime général
Profession Conjoint\tEmployée
besoin assurance sante\tChangement de situation professionnelle
mois d'echeance\tJanvier
Assureur actuel\tMAAF Assurances
Formule choisie\tFormule confort avec options dentaire et optique renforcées
user_id\t123456789`;

  it("transforms Assurland lead to AlptisFormData", () => {
    const lead = parseLead({ text: assurlandTextSample }, { source: "email" });
    expect(lead).not.toBeNull();

    const alptisData = transformLeadForFlow(
      "alptis_sante_select",
      lead!
    ) as AlptisFormData;

    expect(alptisData).toBeDefined();
    expect(alptisData.adherent).toBeDefined();
    expect(alptisData.mise_en_place).toBeDefined();
    expect(alptisData.mise_en_place.date_effet).toBeDefined();
  });

  it("transforms Assurland contact info correctly", () => {
    const lead = parseLead({ text: assurlandTextSample }, { source: "email" });
    const alptisData = transformLeadForFlow(
      "alptis_sante_select",
      lead!
    ) as AlptisFormData;

    expect(alptisData.adherent.nom).toBe("DUPONT");
    expect(alptisData.adherent.prenom).toBe("JEAN");
    expect(alptisData.adherent.code_postal).toBe("75001");
  });

  it("maps profession correctly", () => {
    const lead = parseLead({ text: assurlandTextSample }, { source: "email" });
    const alptisData = transformLeadForFlow(
      "alptis_sante_select",
      lead!
    ) as AlptisFormData;

    expect(alptisData.adherent.categorie_socioprofessionnelle).toBe(
      "PROFESSIONS_LIBERALES_ET_ASSIMILES"
    );
  });

  it("generates fallback date_effet when missing", () => {
    const lead = parseLead({ text: assurlandTextSample }, { source: "email" });
    const alptisData = transformLeadForFlow(
      "alptis_sante_select",
      lead!
    ) as AlptisFormData;

    // Should have a valid date (DD/MM/YYYY format)
    expect(alptisData.mise_en_place.date_effet).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});

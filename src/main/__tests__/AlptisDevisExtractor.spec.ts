import { describe, it, expect } from "vitest";
import { AlptisDevisExtractor } from "../flows/platforms/alptis/extractors/AlptisDevisExtractor";

describe("AlptisDevisExtractor", () => {
  describe("constructor and configuration", () => {
    it("should default to sante_select product", () => {
      const extractor = new AlptisDevisExtractor();
      const selectors = extractor.getResultPageSelectors();

      expect(selectors.urlPattern).toContain("sante-select");
      expect(selectors.urlPattern).not.toContain("sante-pro-plus");
    });

    it("should use sante_select URL pattern when configured", () => {
      const extractor = new AlptisDevisExtractor({ product: "sante_select" });
      const selectors = extractor.getResultPageSelectors();

      expect(selectors.urlPattern).toContain("sante-select");
    });

    it("should use sante_pro_plus URL pattern when configured", () => {
      const extractor = new AlptisDevisExtractor({ product: "sante_pro_plus" });
      const selectors = extractor.getResultPageSelectors();

      expect(selectors.urlPattern).toContain("sante-pro-plus");
      expect(selectors.urlPattern).not.toContain("sante-select\\/");
    });

    it("should have price selector for all products", () => {
      const selectExtractor = new AlptisDevisExtractor({ product: "sante_select" });
      const proPlusExtractor = new AlptisDevisExtractor({ product: "sante_pro_plus" });

      expect(selectExtractor.getResultPageSelectors().priceSelector).toBe("[class*='tarif']");
      expect(proPlusExtractor.getResultPageSelectors().priceSelector).toBe("[class*='tarif']");
    });
  });

  describe("URL pattern matching", () => {
    it("sante_select pattern should match correct URLs", () => {
      const extractor = new AlptisDevisExtractor({ product: "sante_select" });
      const pattern = new RegExp(extractor.getResultPageSelectors().urlPattern);

      expect(pattern.test("/sante-select/projets/12345")).toBe(true);
      expect(pattern.test("/sante-pro-plus/projets/12345")).toBe(false);
    });

    it("sante_pro_plus pattern should match correct URLs", () => {
      const extractor = new AlptisDevisExtractor({ product: "sante_pro_plus" });
      const pattern = new RegExp(extractor.getResultPageSelectors().urlPattern);

      expect(pattern.test("/sante-pro-plus/projets/12345")).toBe(true);
      expect(pattern.test("/sante-select/projets/12345")).toBe(false);
    });

    it("should extract project ID from URL", () => {
      const extractor = new AlptisDevisExtractor({ product: "sante_pro_plus" });
      const pattern = new RegExp(extractor.getResultPageSelectors().urlPattern);

      const match = "/sante-pro-plus/projets/98765".match(pattern);
      expect(match).not.toBeNull();
      expect(match![1]).toBe("98765");
    });
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import {
  createSanteProPlusServices,
  resetSanteProPlusServices,
} from "../flows/engine/services/SanteProPlusServiceFactory";

describe("SanteProPlusServiceFactory", () => {
  beforeEach(() => {
    resetSanteProPlusServices();
  });

  it("should create services with devisExtractor", () => {
    const services = createSanteProPlusServices({
      username: "test",
      password: "test",
    });

    expect(services.auth).toBeDefined();
    expect(services.navigation).toBeDefined();
    expect(services.formFill).toBeDefined();
    expect(services.devisExtractor).toBeDefined();
  });

  it("should create devisExtractor configured for sante_pro_plus", () => {
    const services = createSanteProPlusServices({
      username: "test",
      password: "test",
    });

    const selectors = services.devisExtractor!.getResultPageSelectors();
    expect(selectors.urlPattern).toContain("sante-pro-plus");
  });

  it("should cache services for same credentials", () => {
    const services1 = createSanteProPlusServices({
      username: "test",
      password: "test",
    });
    const services2 = createSanteProPlusServices({
      username: "test",
      password: "test",
    });

    expect(services1).toBe(services2);
  });

  it("should create new services when credentials change", () => {
    const services1 = createSanteProPlusServices({
      username: "test1",
      password: "test1",
    });
    const services2 = createSanteProPlusServices({
      username: "test2",
      password: "test2",
    });

    expect(services1).not.toBe(services2);
  });
});

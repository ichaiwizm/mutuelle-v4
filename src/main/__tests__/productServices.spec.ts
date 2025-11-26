import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestCtx } from "./testUtils";

let cleanup: () => void;

describe("Product configuration and status services", () => {
  beforeAll(async () => {
    const ctx = await setupTestCtx();
    cleanup = ctx.cleanup;
  });

  afterAll(() => {
    cleanup?.();
  });

  it("listAllProducts returns known product configs with metadata", async () => {
    const { ProductConfigCore } = await import("@/main/services/productConfig");
    const products = ProductConfigCore.listAllProducts();

    const keys = products.map((p) => p.flowKey).sort();
    expect(keys).toContain("alptis_sante_select");
    expect(keys).toContain("swisslife_one_slsis");

    for (const p of products) {
      expect(p.metadata?.estimatedTotalDuration).toBeTypeOf("number");
      expect(p.metadata?.requiredStepsCount).toBeGreaterThan(0);
    }
  });

  it("ProductStatusService upsert/getByProduct and listActive work together with ProductConfigQuery", async () => {
    const { ProductStatusService } = await import("@/main/services/productStatusService");
    const { ProductConfigQuery } = await import("@/main/services/productConfig");

    // Mark only alptis_sante_select as active in DB
    await ProductStatusService.upsert("alptis", "sante_select", "active");
    await ProductStatusService.upsert("swisslife", "slsis", "inactive");

    const statusAlptis = await ProductStatusService.getByProduct("alptis", "sante_select");
    expect(statusAlptis).not.toBeNull();
    expect(statusAlptis?.status).toBe("active");

    const statusSwiss = await ProductStatusService.getByProduct("swisslife", "slsis");
    expect(statusSwiss).not.toBeNull();
    expect(statusSwiss?.status).toBe("inactive");

    const activeConfigs = await ProductConfigQuery.listActiveProducts();
    const activeFlowKeys = activeConfigs.map((c) => c.flowKey);

    expect(activeFlowKeys).toContain("alptis_sante_select");
    expect(activeFlowKeys).not.toContain("swisslife_one_slsis");
  });
});


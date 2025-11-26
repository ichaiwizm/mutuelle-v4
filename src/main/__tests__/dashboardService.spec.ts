import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestCtx } from "./testUtils";

let cleanup: () => void;

describe("DashboardService", () => {
  beforeAll(async () => {
    const ctx = await setupTestCtx();
    cleanup = ctx.cleanup;
  });

  afterAll(() => {
    cleanup?.();
  });

  it("getDashboardOverview returns a coherent overview object", async () => {
    const { getDashboardOverview } = await import("@/main/services/dashboardService");
    const { ProductStatusService } = await import("@/main/services/productStatusService");

    // Ensure at least one active product status for visibility on dashboard
    await ProductStatusService.upsert("alptis", "sante_select", "active");

    const overview = await getDashboardOverview();

    // Mail status always present
    expect(overview.mail).toHaveProperty("ok");

    // Leads count is a number
    expect(overview.leads.total).toBeTypeOf("number");

    // Automation summary structure
    expect(overview.automation.totalRuns).toBeTypeOf("number");
    expect(Array.isArray(overview.automation.recentRuns)).toBe(true);

    // Flows use seeded flows (at least 2)
    expect(overview.flows.total).toBeGreaterThanOrEqual(2);
    expect(overview.flows.items.length).toBeGreaterThanOrEqual(2);

    // FlowStates summary is present
    expect(overview.flowStates.pausedCount).toBeTypeOf("number");

    // Products active at least 1 after upsert
    expect(overview.products.activeCount).toBeGreaterThanOrEqual(1);
    expect(overview.products.active.length).toBeGreaterThanOrEqual(1);
  });
});


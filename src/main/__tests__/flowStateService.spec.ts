import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestCtx } from "./testUtils";

let cleanup: () => void;

describe("FlowStateService", () => {
  beforeAll(async () => {
    const ctx = await setupTestCtx();
    cleanup = ctx.cleanup;
  });

  afterAll(() => {
    cleanup?.();
  });

  it("creates, retrieves, updates and deletes flow states", async () => {
    const { flowStateService } = await import("@/main/flows/state");

    const state = await flowStateService.createState("test_flow_key", "lead-123");
    expect(state.id).toBeTypeOf("string");
    expect(state.flowKey).toBe("test_flow_key");
    expect(state.leadId).toBe("lead-123");
    expect(state.status).toBe("running");
    expect(state.currentStepIndex).toBe(0);

    const loaded = await flowStateService.getState(state.id);
    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe(state.id);

    await flowStateService.markPaused(state.id);
    const paused = await flowStateService.getState(state.id);
    expect(paused!.status).toBe("paused");
    expect(paused!.pausedAt).toBeDefined();

    await flowStateService.markCompleted(state.id);
    const completed = await flowStateService.getState(state.id);
    expect(completed!.status).toBe("completed");
    expect(completed!.completedAt).toBeDefined();

    const byKey = await flowStateService.getFlowsByKey("test_flow_key");
    expect(byKey.map((s) => s.id)).toContain(state.id);

    const byLead = await flowStateService.getFlowsByLeadId("lead-123");
    expect(byLead.map((s) => s.id)).toContain(state.id);

    await flowStateService.deleteState(state.id);
    const afterDelete = await flowStateService.getState(state.id);
    expect(afterDelete).toBeNull();
  });
});


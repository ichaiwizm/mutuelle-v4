import { describe, it, expect } from "vitest";
import { buildFlowResult } from "../../flows/engine/core";
import type { StepResult } from "../../flows/engine/types";

describe("buildFlowResult", () => {
  it("builds successful result when all steps pass", () => {
    const steps: StepResult[] = [
      { success: true, stepId: "step1", duration: 100, retries: 0 },
      { success: true, stepId: "step2", duration: 200, retries: 0 },
    ];

    const result = buildFlowResult({
      flowKey: "test_flow",
      leadId: "lead123",
      steps,
      startTime: Date.now() - 500,
    });

    expect(result.success).toBe(true);
    expect(result.flowKey).toBe("test_flow");
    expect(result.leadId).toBe("lead123");
    expect(result.steps).toHaveLength(2);
    expect(result.totalDuration).toBeGreaterThan(0);
  });

  it("builds failed result when a step fails", () => {
    const steps: StepResult[] = [
      { success: true, stepId: "step1", duration: 100, retries: 0 },
      { success: false, stepId: "step2", duration: 200, retries: 1, error: new Error("Step failed") },
    ];

    const result = buildFlowResult({
      flowKey: "test_flow",
      steps,
      startTime: Date.now() - 500,
    });

    expect(result.success).toBe(false);
  });

  it("builds paused result", () => {
    const result = buildFlowResult({
      flowKey: "test_flow",
      steps: [],
      startTime: Date.now(),
      stateId: "state123",
      paused: true,
    });

    expect(result.success).toBe(false);
    expect(result.paused).toBe(true);
    expect(result.stateId).toBe("state123");
  });

  it("builds error result", () => {
    const error = new Error("Flow crashed");
    const result = buildFlowResult({
      flowKey: "test_flow",
      steps: [],
      startTime: Date.now(),
      error,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe(error);
  });
});

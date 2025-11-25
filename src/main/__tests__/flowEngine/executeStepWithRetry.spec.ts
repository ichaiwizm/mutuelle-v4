import { describe, it, expect, vi } from "vitest";
import { executeStepWithRetry } from "../../flows/engine/core";
import type { IStep, ExecutionContext } from "../../flows/engine/types";

describe("executeStepWithRetry", () => {
  it("returns success on first attempt if step succeeds", async () => {
    const mockStep: IStep = {
      execute: vi.fn().mockResolvedValue({ success: true, stepId: "test", duration: 100 }),
    };

    const mockRegistry = {
      get: vi.fn().mockReturnValue(mockStep),
    };

    const stepDef = { id: "test", stepClass: "TestStep", maxRetries: 2 };
    const context = { flowKey: "test_flow" } as ExecutionContext;

    const result = await executeStepWithRetry(stepDef as any, context, {
      registry: mockRegistry as any,
      hooks: {},
      emitter: { emit: vi.fn() } as any,
    });

    expect(result.success).toBe(true);
    expect(result.retries).toBe(0);
    expect(mockStep.execute).toHaveBeenCalledTimes(1);
  });

  it("retries on failure and succeeds", async () => {
    let attempts = 0;
    const mockStep: IStep = {
      execute: vi.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 2) {
          return { success: false, stepId: "test", duration: 100, error: new Error("Failed") };
        }
        return { success: true, stepId: "test", duration: 100 };
      }),
    };

    const mockRegistry = {
      get: vi.fn().mockReturnValue(mockStep),
    };

    const stepDef = { id: "test", stepClass: "TestStep", maxRetries: 2 };
    const context = { flowKey: "test_flow" } as ExecutionContext;

    const result = await executeStepWithRetry(stepDef as any, context, {
      registry: mockRegistry as any,
      hooks: {},
      emitter: { emit: vi.fn() } as any,
    });

    expect(result.success).toBe(true);
    expect(result.retries).toBe(1);
    expect(mockStep.execute).toHaveBeenCalledTimes(2);
  });

  it("returns failure after exhausting retries", async () => {
    const mockStep: IStep = {
      execute: vi.fn().mockResolvedValue({ success: false, stepId: "test", duration: 100, error: new Error("Always fails") }),
    };

    const mockRegistry = {
      get: vi.fn().mockReturnValue(mockStep),
    };

    const stepDef = { id: "test", stepClass: "TestStep", maxRetries: 1 };
    const context = { flowKey: "test_flow" } as ExecutionContext;

    const result = await executeStepWithRetry(stepDef as any, context, {
      registry: mockRegistry as any,
      hooks: {},
      emitter: { emit: vi.fn() } as any,
    });

    expect(result.success).toBe(false);
    expect(result.retries).toBe(1);
    expect(mockStep.execute).toHaveBeenCalledTimes(2); // initial + 1 retry
  });

  it("throws if stepClass is missing", async () => {
    const stepDef = { id: "test" }; // No stepClass
    const context = { flowKey: "test_flow" } as ExecutionContext;

    await expect(
      executeStepWithRetry(stepDef as any, context, {
        registry: {} as any,
        hooks: {},
        emitter: { emit: vi.fn() } as any,
      })
    ).rejects.toThrow("Step test has no stepClass defined");
  });
});

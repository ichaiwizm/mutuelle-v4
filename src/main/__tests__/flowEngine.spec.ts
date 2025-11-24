import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlowEngine } from "../flows/engine/FlowEngine";
import { HooksManager } from "../flows/engine/hooks";
import { PauseResumeManager } from "../flows/engine/pause";
import { StepRegistry } from "../flows/engine/StepRegistry";
import { buildFlowResult, executeStepWithRetry } from "../flows/engine/core";
import type { FlowHooks, StepResult, IStep, ExecutionContext } from "../flows/engine/types";

describe("FlowEngine - Unit Tests", () => {
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

  describe("HooksManager", () => {
    it("calls hooks when provided", async () => {
      const mockEmitter = { emit: vi.fn() };
      const hooks: FlowHooks = {
        beforeFlow: vi.fn(),
        afterFlow: vi.fn(),
      };

      const manager = new HooksManager(hooks, mockEmitter as any);

      await manager.beforeFlow({} as any);
      expect(hooks.beforeFlow).toHaveBeenCalled();

      await manager.flowStart("test", "lead1");
      expect(mockEmitter.emit).toHaveBeenCalledWith("flow:start", expect.any(Object));
    });

    it("handles missing hooks gracefully", async () => {
      const mockEmitter = { emit: vi.fn() };
      const manager = new HooksManager({}, mockEmitter as any);

      // Should not throw
      await manager.beforeFlow({} as any);
      await manager.afterFlow({} as any, {} as any);
    });
  });

  describe("PauseResumeManager", () => {
    it("initializes disabled when not enabled", async () => {
      const mockService = { getState: vi.fn(), createState: vi.fn() };
      const manager = new PauseResumeManager({ enabled: false }, mockService as any);

      const startIndex = await manager.initialize("flow", "lead");

      expect(startIndex).toBe(0);
      expect(mockService.createState).not.toHaveBeenCalled();
    });

    it("requestPause sets flag when enabled", () => {
      const mockService = {} as any;
      const manager = new PauseResumeManager({ enabled: true }, mockService);

      expect(manager.isPauseRequested).toBe(false);
      manager.requestPause();
      expect(manager.isPauseRequested).toBe(true);
    });

    it("requestPause does nothing when disabled", () => {
      const mockService = {} as any;
      const manager = new PauseResumeManager({ enabled: false }, mockService);

      manager.requestPause();
      expect(manager.isPauseRequested).toBe(false);
    });

    it("reset clears pause flag", () => {
      const mockService = {} as any;
      const manager = new PauseResumeManager({ enabled: true }, mockService);

      manager.requestPause();
      expect(manager.isPauseRequested).toBe(true);

      manager.reset();
      expect(manager.isPauseRequested).toBe(false);
    });
  });

  describe("FlowEngine constructor", () => {
    it("creates instance with default config", () => {
      const engine = new FlowEngine();
      expect(engine).toBeInstanceOf(FlowEngine);
    });

    it("creates instance with custom hooks", () => {
      const hooks: FlowHooks = {
        beforeStep: vi.fn(),
        afterStep: vi.fn(),
      };

      const engine = new FlowEngine({ hooks });
      expect(engine).toBeInstanceOf(FlowEngine);
    });

    it("creates instance with pause/resume enabled", () => {
      const engine = new FlowEngine({ enablePauseResume: true });
      expect(engine).toBeInstanceOf(FlowEngine);
      expect(engine.isPauseRequested()).toBe(false);
    });
  });

  describe("StepRegistry", () => {
    it("has() returns true for registered steps", () => {
      const registry = StepRegistry.getInstance();
      expect(registry.has("AlptisAuthStep")).toBe(true);
      expect(registry.has("AlptisNavigationStep")).toBe(true);
      expect(registry.has("AlptisFormFillStep")).toBe(true);
    });

    it("has() returns false for unregistered steps", () => {
      const registry = StepRegistry.getInstance();
      expect(registry.has("NonExistentStep")).toBe(false);
      expect(registry.has("")).toBe(false);
    });

    it("get() throws for unregistered steps", () => {
      const registry = StepRegistry.getInstance();
      expect(() => registry.get("NonExistentStep")).toThrow("Step class not found in registry: NonExistentStep");
    });
  });

  describe("PauseResumeManager - Checkpoint", () => {
    it("checkpoint updates state atomically after DB success", async () => {
      const mockUpdateState = vi.fn().mockResolvedValue(undefined);
      const mockService = {
        createState: vi.fn().mockResolvedValue({
          id: "state123",
          flowKey: "test_flow",
          currentStepIndex: 0,
          completedSteps: [],
          status: "running",
          startedAt: Date.now(),
        }),
        updateState: mockUpdateState,
      };

      const manager = new PauseResumeManager({ enabled: true }, mockService as any);
      await manager.initialize("test_flow", "lead123");

      await manager.checkpoint(0, "step1");

      // Verify DB was called with correct data
      expect(mockUpdateState).toHaveBeenCalledWith("state123", {
        currentStepIndex: 1,
        completedSteps: ["step1"],
      });

      // Verify local state was updated
      const state = manager.state;
      expect(state?.currentStepIndex).toBe(1);
      expect(state?.completedSteps).toEqual(["step1"]);
    });

    it("checkpoint does not update local state if DB fails", async () => {
      const mockUpdateState = vi.fn().mockRejectedValue(new Error("DB Error"));
      const mockService = {
        createState: vi.fn().mockResolvedValue({
          id: "state123",
          flowKey: "test_flow",
          currentStepIndex: 0,
          completedSteps: [],
          status: "running",
          startedAt: Date.now(),
        }),
        updateState: mockUpdateState,
      };

      const manager = new PauseResumeManager({ enabled: true }, mockService as any);
      await manager.initialize("test_flow", "lead123");

      await expect(manager.checkpoint(0, "step1")).rejects.toThrow("DB Error");

      // Verify local state was NOT updated
      const state = manager.state;
      expect(state?.currentStepIndex).toBe(0);
      expect(state?.completedSteps).toEqual([]);
    });

    it("state getter returns immutable copy", async () => {
      const mockService = {
        createState: vi.fn().mockResolvedValue({
          id: "state123",
          flowKey: "test_flow",
          currentStepIndex: 0,
          completedSteps: ["step1"],
          status: "running",
          startedAt: Date.now(),
        }),
      };

      const manager = new PauseResumeManager({ enabled: true }, mockService as any);
      await manager.initialize("test_flow", "lead123");

      const state1 = manager.state;
      const state2 = manager.state;

      // Should be different objects (copies)
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe("PauseResumeManager - State Transitions", () => {
    it("markPaused updates state status", async () => {
      const mockMarkPaused = vi.fn().mockResolvedValue(undefined);
      const mockService = {
        createState: vi.fn().mockResolvedValue({
          id: "state123",
          flowKey: "test_flow",
          currentStepIndex: 0,
          completedSteps: [],
          status: "running",
          startedAt: Date.now(),
        }),
        markPaused: mockMarkPaused,
      };

      const manager = new PauseResumeManager({ enabled: true }, mockService as any);
      await manager.initialize("test_flow", "lead123");
      await manager.markPaused();

      expect(mockMarkPaused).toHaveBeenCalledWith("state123");
    });

    it("markCompleted updates state status", async () => {
      const mockMarkCompleted = vi.fn().mockResolvedValue(undefined);
      const mockService = {
        createState: vi.fn().mockResolvedValue({
          id: "state123",
          flowKey: "test_flow",
          currentStepIndex: 0,
          completedSteps: [],
          status: "running",
          startedAt: Date.now(),
        }),
        markCompleted: mockMarkCompleted,
      };

      const manager = new PauseResumeManager({ enabled: true }, mockService as any);
      await manager.initialize("test_flow", "lead123");
      await manager.markCompleted();

      expect(mockMarkCompleted).toHaveBeenCalledWith("state123");
    });

    it("markFailed updates state status", async () => {
      const mockMarkFailed = vi.fn().mockResolvedValue(undefined);
      const mockService = {
        createState: vi.fn().mockResolvedValue({
          id: "state123",
          flowKey: "test_flow",
          currentStepIndex: 0,
          completedSteps: [],
          status: "running",
          startedAt: Date.now(),
        }),
        markFailed: mockMarkFailed,
      };

      const manager = new PauseResumeManager({ enabled: true }, mockService as any);
      await manager.initialize("test_flow", "lead123");
      await manager.markFailed();

      expect(mockMarkFailed).toHaveBeenCalledWith("state123");
    });
  });

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
});

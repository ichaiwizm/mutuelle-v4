import { describe, it, expect, vi } from "vitest";
import { PauseResumeManager } from "../../flows/engine/pause";

describe("PauseResumeManager", () => {
  describe("Basic Operations", () => {
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

  describe("Checkpoint", () => {
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

  describe("State Transitions", () => {
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
});

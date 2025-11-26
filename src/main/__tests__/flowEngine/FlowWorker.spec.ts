import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlowWorker } from "../../flows/engine/pool/FlowWorker";
import type { FlowTask } from "../../flows/engine/pool/types";
import type { FlowExecutionResult } from "../../flows/engine/types";

// Mock FlowEngine with a class
const mockExecute = vi.fn<() => Promise<FlowExecutionResult>>();
const mockRequestPause = vi.fn();

vi.mock("../../flows/engine/FlowEngine", () => ({
  FlowEngine: class MockFlowEngine {
    execute = mockExecute;
    requestPause = mockRequestPause;
  },
}));

describe("FlowWorker", () => {
  let mockContext: any;
  let mockPage: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPage = {
      close: vi.fn().mockResolvedValue(undefined),
    };

    mockContext = {
      newPage: vi.fn().mockResolvedValue(mockPage),
    };

    // Default success response
    mockExecute.mockResolvedValue({
      success: true,
      flowKey: "test_flow",
      leadId: "lead-1",
      steps: [],
      totalDuration: 1000,
    });
  });

  const createTask = (overrides?: Partial<FlowTask>): FlowTask => ({
    id: "task-1",
    flowKey: "alptis_sante_select",
    leadId: "lead-1",
    lead: { id: "lead-1" } as any,
    ...overrides,
  });

  describe("constructor", () => {
    it("creates a worker with idle status", () => {
      const worker = new FlowWorker("worker-1", mockContext);
      expect(worker.status).toBe("idle");
      expect(worker.workerId).toBe("worker-1");
    });
  });

  describe("execute", () => {
    it("executes a task successfully", async () => {
      const worker = new FlowWorker("worker-1", mockContext);
      const task = createTask();

      const result = await worker.execute(task);

      expect(result.success).toBe(true);
      expect(result.flowKey).toBe("test_flow");
      expect(mockContext.newPage).toHaveBeenCalled();
    });

    it("sets status to running during execution", async () => {
      const worker = new FlowWorker("worker-1", mockContext);
      const task = createTask();

      // Check status during execution
      const executePromise = worker.execute(task);
      // Status should be running immediately
      expect(worker.status).toBe("running");

      await executePromise;
    });

    it("sets status to completed on success", async () => {
      const worker = new FlowWorker("worker-1", mockContext);
      const task = createTask();

      await worker.execute(task);

      expect(worker.status).toBe("completed");
    });

    it("sets status to error on failure", async () => {
      mockExecute.mockResolvedValueOnce({
        success: false,
        flowKey: "test_flow",
        error: new Error("Test error"),
        steps: [],
        totalDuration: 0,
      });

      const worker = new FlowWorker("worker-1", mockContext);
      const task = createTask();

      const result = await worker.execute(task);

      expect(result.success).toBe(false);
      expect(worker.status).toBe("error");
    });

    it("handles exceptions during execution", async () => {
      mockExecute.mockRejectedValueOnce(new Error("Unexpected error"));

      const worker = new FlowWorker("worker-1", mockContext);
      const task = createTask();

      const result = await worker.execute(task);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("Unexpected error");
      expect(worker.status).toBe("error");
    });

    it("passes transformedData to FlowEngine", async () => {
      const worker = new FlowWorker("worker-1", mockContext);
      const task = createTask({
        transformedData: { adherent: { nom: "Test" } },
      });

      await worker.execute(task);

      expect(mockExecute).toHaveBeenCalledWith(
        "alptis_sante_select",
        expect.objectContaining({
          transformedData: { adherent: { nom: "Test" } },
        })
      );
    });

    it("passes artifacts dir to FlowEngine", async () => {
      const worker = new FlowWorker("worker-1", mockContext);
      const task = createTask({
        artifactsDir: "/tmp/artifacts",
      });

      await worker.execute(task);

      expect(mockExecute).toHaveBeenCalledWith(
        "alptis_sante_select",
        expect.objectContaining({
          artifactsDir: "/tmp/artifacts",
        })
      );
    });
  });

  describe("requestPause", () => {
    it("requests pause on running engine", async () => {
      // Make execute take some time
      mockExecute.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  success: true,
                  flowKey: "test",
                  steps: [],
                  totalDuration: 0,
                }),
              100
            );
          })
      );

      const worker = new FlowWorker("worker-1", mockContext);
      const task = createTask();

      const executePromise = worker.execute(task);

      // Give time for status to change to running
      await new Promise((r) => setTimeout(r, 10));

      // Request pause while running
      worker.requestPause();
      expect(mockRequestPause).toHaveBeenCalled();

      await executePromise;
    });

    it("does nothing when not running", () => {
      const worker = new FlowWorker("worker-1", mockContext);
      worker.requestPause(); // Should not throw
      expect(worker.status).toBe("idle");
      expect(mockRequestPause).not.toHaveBeenCalled();
    });
  });

  describe("cleanup", () => {
    it("closes the page", async () => {
      const worker = new FlowWorker("worker-1", mockContext);
      const task = createTask();

      await worker.execute(task);
      await worker.cleanup();

      expect(mockPage.close).toHaveBeenCalled();
    });

    it("resets status to idle", async () => {
      const worker = new FlowWorker("worker-1", mockContext);
      const task = createTask();

      await worker.execute(task);
      expect(worker.status).toBe("completed");

      await worker.cleanup();
      expect(worker.status).toBe("idle");
    });

    it("handles cleanup when page never created", async () => {
      const worker = new FlowWorker("worker-1", mockContext);
      await worker.cleanup(); // Should not throw
      expect(worker.status).toBe("idle");
    });

    it("handles page close error gracefully", async () => {
      mockPage.close.mockRejectedValueOnce(new Error("Close error"));

      const worker = new FlowWorker("worker-1", mockContext);
      const task = createTask();

      await worker.execute(task);
      await worker.cleanup(); // Should not throw

      expect(worker.status).toBe("idle");
    });
  });
});

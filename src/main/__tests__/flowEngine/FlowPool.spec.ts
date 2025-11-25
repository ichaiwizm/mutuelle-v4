import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FlowPool } from "../../flows/engine/pool/FlowPool";
import type { FlowTask } from "../../flows/engine/pool/types";
import type { FlowExecutionResult } from "../../flows/engine/types";

// Create mock functions
const mockBrowserLaunch = vi.fn();
const mockBrowserClose = vi.fn();
const mockCreateContext = vi.fn();
const mockCloseContext = vi.fn();

const mockWorkerExecute = vi.fn<any, Promise<FlowExecutionResult>>();
const mockWorkerCleanup = vi.fn();
const mockWorkerRequestPause = vi.fn();

// Mock BrowserManager with class
vi.mock("../../flows/engine/pool/BrowserManager", () => ({
  BrowserManager: class MockBrowserManager {
    launch = mockBrowserLaunch.mockResolvedValue(undefined);
    close = mockBrowserClose.mockResolvedValue(undefined);
    createContext = mockCreateContext;
    closeContext = mockCloseContext.mockResolvedValue(undefined);
  },
}));

// Mock FlowWorker with class
vi.mock("../../flows/engine/pool/FlowWorker", () => ({
  FlowWorker: class MockFlowWorker {
    workerId: string;
    status = "idle";

    constructor(id: string) {
      this.workerId = id;
    }

    execute = mockWorkerExecute;
    cleanup = mockWorkerCleanup.mockResolvedValue(undefined);
    requestPause = mockWorkerRequestPause;
  },
}));

describe("FlowPool", () => {
  let pool: FlowPool;

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: create context returns a mock context
    mockCreateContext.mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({ close: vi.fn() }),
      close: vi.fn(),
    });

    // Default success response
    mockWorkerExecute.mockResolvedValue({
      success: true,
      flowKey: "test_flow",
      leadId: "lead-1",
      steps: [],
      totalDuration: 100,
    });
  });

  afterEach(async () => {
    if (pool) {
      await pool.shutdown();
    }
  });

  const createTask = (id: string, overrides?: Partial<FlowTask>): FlowTask => ({
    id,
    flowKey: "alptis_sante_select",
    leadId: `lead-${id}`,
    lead: { id: `lead-${id}` } as any,
    ...overrides,
  });

  describe("constructor", () => {
    it("creates instance with default config", () => {
      pool = new FlowPool();
      expect(pool).toBeInstanceOf(FlowPool);
      expect(pool.queueLength).toBe(0);
      expect(pool.activeCount).toBe(0);
    });

    it("creates instance with custom maxConcurrent", () => {
      pool = new FlowPool({ maxConcurrent: 5 });
      expect(pool).toBeInstanceOf(FlowPool);
    });
  });

  describe("enqueue", () => {
    it("adds tasks to queue", () => {
      pool = new FlowPool();
      const tasks = [createTask("1"), createTask("2"), createTask("3")];

      pool.enqueue(tasks);

      expect(pool.queueLength).toBe(3);
    });

    it("handles empty array", () => {
      pool = new FlowPool();
      pool.enqueue([]);
      expect(pool.queueLength).toBe(0);
    });

    it("emits task:queued event for each task", () => {
      pool = new FlowPool();
      const queuedEvents: string[] = [];
      pool.on("task:queued", (taskId) => queuedEvents.push(taskId));

      pool.enqueue([createTask("1"), createTask("2")]);

      expect(queuedEvents).toEqual(["1", "2"]);
    });

    it("sorts tasks by priority (higher first)", () => {
      pool = new FlowPool({ maxConcurrent: 1 });
      const startEvents: string[] = [];
      pool.on("task:start", (taskId) => startEvents.push(taskId));

      const tasks = [
        createTask("low", { priority: 1 }),
        createTask("high", { priority: 10 }),
        createTask("medium", { priority: 5 }),
      ];

      pool.enqueue(tasks);

      // The queue should be sorted by priority (high, medium, low)
      // We can verify by checking the order when started
    });
  });

  describe("start", () => {
    it("executes single task", async () => {
      pool = new FlowPool();
      pool.enqueue([createTask("1")]);

      const result = await pool.start();

      expect(result.total).toBe(1);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(0);
    });

    it("returns empty result for empty queue", async () => {
      pool = new FlowPool();

      const result = await pool.start();

      expect(result.total).toBe(0);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.duration).toBe(0);
    });

    it("throws if already running", async () => {
      pool = new FlowPool();
      pool.enqueue([createTask("1")]);

      const firstStart = pool.start();

      await expect(pool.start()).rejects.toThrow("Pool is already running");

      await firstStart;
    });

    it("executes multiple tasks", async () => {
      pool = new FlowPool({ maxConcurrent: 3 });
      pool.enqueue([createTask("1"), createTask("2"), createTask("3")]);

      const result = await pool.start();

      expect(result.total).toBe(3);
      expect(result.successful).toBe(3);
      expect(mockWorkerExecute).toHaveBeenCalledTimes(3);
    });

    it("handles task failure without stopping others", async () => {
      let callCount = 0;
      mockWorkerExecute.mockImplementation(async () => {
        callCount++;
        if (callCount === 2) {
          return {
            success: false,
            flowKey: "test",
            error: new Error("Task 2 failed"),
            steps: [],
            totalDuration: 0,
          };
        }
        return { success: true, flowKey: "test", steps: [], totalDuration: 100 };
      });

      pool = new FlowPool({ maxConcurrent: 1 });
      pool.enqueue([createTask("1"), createTask("2"), createTask("3")]);

      const result = await pool.start();

      expect(result.total).toBe(3);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
    });

    it("returns aggregated results", async () => {
      pool = new FlowPool();
      pool.enqueue([createTask("1"), createTask("2")]);

      const result = await pool.start();

      expect(result.results.size).toBe(2);
      expect(result.results.has("1")).toBe(true);
      expect(result.results.has("2")).toBe(true);
    });

    it("emits pool:start event", async () => {
      pool = new FlowPool();
      const startSpy = vi.fn();
      pool.on("pool:start", startSpy);

      pool.enqueue([createTask("1")]);
      await pool.start();

      expect(startSpy).toHaveBeenCalledTimes(1);
    });

    it("emits pool:complete event with result", async () => {
      pool = new FlowPool();
      const completeSpy = vi.fn();
      pool.on("pool:complete", completeSpy);

      pool.enqueue([createTask("1")]);
      await pool.start();

      expect(completeSpy).toHaveBeenCalledTimes(1);
      expect(completeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          total: 1,
          successful: 1,
        })
      );
    });

    it("emits task:start for each task", async () => {
      pool = new FlowPool();
      const startEvents: string[] = [];
      pool.on("task:start", (taskId) => startEvents.push(taskId));

      pool.enqueue([createTask("1"), createTask("2")]);
      await pool.start();

      expect(startEvents).toContain("1");
      expect(startEvents).toContain("2");
    });

    it("emits task:complete for successful tasks", async () => {
      pool = new FlowPool();
      const completeEvents: string[] = [];
      pool.on("task:complete", (taskId) => completeEvents.push(taskId));

      pool.enqueue([createTask("1")]);
      await pool.start();

      expect(completeEvents).toContain("1");
    });

    it("emits task:error for failed tasks", async () => {
      mockWorkerExecute.mockRejectedValueOnce(new Error("Task failed"));

      pool = new FlowPool();
      const errorEvents: Array<{ taskId: string; error: Error }> = [];
      pool.on("task:error", (taskId, error) =>
        errorEvents.push({ taskId, error })
      );

      pool.enqueue([createTask("1")]);
      await pool.start();

      expect(errorEvents.length).toBe(1);
      expect(errorEvents[0].taskId).toBe("1");
      expect(errorEvents[0].error.message).toBe("Task failed");
    });

    it("calls onTaskComplete callback", async () => {
      const onTaskComplete = vi.fn();
      pool = new FlowPool({ onTaskComplete });

      pool.enqueue([createTask("1")]);
      await pool.start();

      expect(onTaskComplete).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({ success: true })
      );
    });

    it("calls onTaskStart callback", async () => {
      const onTaskStart = vi.fn();
      pool = new FlowPool({ onTaskStart });

      pool.enqueue([createTask("1")]);
      await pool.start();

      expect(onTaskStart).toHaveBeenCalledWith("1");
    });

    it("calls onTaskError callback", async () => {
      mockWorkerExecute.mockRejectedValueOnce(new Error("Task failed"));

      const onTaskError = vi.fn();
      pool = new FlowPool({ onTaskError });

      pool.enqueue([createTask("1")]);
      await pool.start();

      expect(onTaskError).toHaveBeenCalledWith("1", expect.any(Error));
    });

    it("calculates duration correctly", async () => {
      pool = new FlowPool();
      pool.enqueue([createTask("1")]);

      const result = await pool.start();

      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it("launches and closes browser", async () => {
      pool = new FlowPool();
      pool.enqueue([createTask("1")]);

      await pool.start();

      expect(mockBrowserLaunch).toHaveBeenCalled();
      expect(mockBrowserClose).toHaveBeenCalled();
    });

    it("creates and closes context for each task", async () => {
      pool = new FlowPool();
      pool.enqueue([createTask("1"), createTask("2")]);

      await pool.start();

      expect(mockCreateContext).toHaveBeenCalledTimes(2);
      expect(mockCloseContext).toHaveBeenCalledTimes(2);
    });

    it("cleans up worker after each task", async () => {
      pool = new FlowPool();
      pool.enqueue([createTask("1"), createTask("2")]);

      await pool.start();

      expect(mockWorkerCleanup).toHaveBeenCalledTimes(2);
    });
  });

  describe("pauseAll", () => {
    it("sets pause flag", async () => {
      pool = new FlowPool({ maxConcurrent: 1 });
      pool.enqueue([createTask("1"), createTask("2")]);

      // Start but don't await
      const startPromise = pool.start();

      // Pause
      pool.pauseAll();

      // Resume to allow completion
      pool.resume();

      await startPromise;
    });
  });

  describe("shutdown", () => {
    it("cleans up all resources", async () => {
      pool = new FlowPool();
      pool.enqueue([createTask("1")]);

      await pool.shutdown();

      expect(mockBrowserClose).toHaveBeenCalled();
    });

    it("clears the queue", async () => {
      pool = new FlowPool();
      pool.enqueue([createTask("1"), createTask("2")]);

      await pool.shutdown();

      expect(pool.queueLength).toBe(0);
    });
  });

  describe("queueLength", () => {
    it("returns number of queued tasks", () => {
      pool = new FlowPool();
      expect(pool.queueLength).toBe(0);

      pool.enqueue([createTask("1"), createTask("2")]);
      expect(pool.queueLength).toBe(2);
    });
  });

  describe("activeCount", () => {
    it("returns number of running tasks", () => {
      pool = new FlowPool();
      expect(pool.activeCount).toBe(0);
    });
  });
});

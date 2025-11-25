import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BrowserManager } from "../../flows/engine/pool/BrowserManager";

// Create fresh mocks for each test
const createMocks = () => {
  const mockContexts: any[] = [];

  const createMockContext = () => {
    const ctx = {
      close: vi.fn().mockResolvedValue(undefined),
      newPage: vi.fn().mockResolvedValue({ close: vi.fn() }),
    };
    mockContexts.push(ctx);
    return ctx;
  };

  const mockBrowser = {
    newContext: vi.fn().mockImplementation(createMockContext),
    close: vi.fn().mockResolvedValue(undefined),
  };

  return { mockBrowser, mockContexts };
};

let mocks: ReturnType<typeof createMocks>;

vi.mock("playwright", () => ({
  chromium: {
    launch: vi.fn().mockImplementation(async () => mocks.mockBrowser),
  },
}));

describe("BrowserManager", () => {
  let manager: BrowserManager;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks = createMocks();
    manager = new BrowserManager();
  });

  afterEach(async () => {
    await manager.close();
  });

  describe("constructor", () => {
    it("creates instance with default options", () => {
      const mgr = new BrowserManager();
      expect(mgr).toBeInstanceOf(BrowserManager);
      expect(mgr.isRunning()).toBe(false);
    });

    it("creates instance with custom options", () => {
      const mgr = new BrowserManager({ headless: false, slowMo: 100 });
      expect(mgr).toBeInstanceOf(BrowserManager);
    });
  });

  describe("launch", () => {
    it("launches the browser", async () => {
      expect(manager.isRunning()).toBe(false);
      await manager.launch();
      expect(manager.isRunning()).toBe(true);
    });

    it("does not launch twice", async () => {
      const { chromium } = await import("playwright");
      await manager.launch();
      await manager.launch();
      expect(chromium.launch).toHaveBeenCalledTimes(1);
    });
  });

  describe("createContext", () => {
    it("creates an isolated browser context", async () => {
      await manager.launch();
      const context = await manager.createContext();
      expect(context).toBeDefined();
      expect(manager.getActiveContextCount()).toBe(1);
    });

    it("throws if browser not launched", async () => {
      await expect(manager.createContext()).rejects.toThrow(
        "Browser not launched"
      );
    });

    it("creates multiple independent contexts", async () => {
      await manager.launch();
      const ctx1 = await manager.createContext();
      const ctx2 = await manager.createContext();
      const ctx3 = await manager.createContext();

      expect(ctx1).toBeDefined();
      expect(ctx2).toBeDefined();
      expect(ctx3).toBeDefined();
      expect(ctx1).not.toBe(ctx2);
      expect(ctx2).not.toBe(ctx3);
      expect(manager.getActiveContextCount()).toBe(3);
    });
  });

  describe("closeContext", () => {
    it("closes a specific context", async () => {
      await manager.launch();
      const context = await manager.createContext();
      expect(manager.getActiveContextCount()).toBe(1);

      await manager.closeContext(context);
      expect(manager.getActiveContextCount()).toBe(0);
      expect(context.close).toHaveBeenCalled();
    });

    it("handles closing non-tracked context gracefully", async () => {
      await manager.launch();
      const fakeContext = { close: vi.fn() } as any;
      await manager.closeContext(fakeContext);
      // Should not throw
      expect(fakeContext.close).not.toHaveBeenCalled();
    });
  });

  describe("close", () => {
    it("closes all contexts and browser", async () => {
      await manager.launch();
      await manager.createContext();
      await manager.createContext();

      await manager.close();

      expect(mocks.mockContexts[0].close).toHaveBeenCalled();
      expect(mocks.mockContexts[1].close).toHaveBeenCalled();
      expect(manager.isRunning()).toBe(false);
      expect(manager.getActiveContextCount()).toBe(0);
    });

    it("handles close when not launched", async () => {
      await manager.close();
      // Should not throw
      expect(manager.isRunning()).toBe(false);
    });
  });

  describe("getActiveContextCount", () => {
    it("returns 0 when no contexts", async () => {
      await manager.launch();
      expect(manager.getActiveContextCount()).toBe(0);
    });

    it("tracks context count accurately", async () => {
      await manager.launch();
      const ctx1 = await manager.createContext();
      expect(manager.getActiveContextCount()).toBe(1);

      await manager.createContext();
      expect(manager.getActiveContextCount()).toBe(2);

      await manager.closeContext(ctx1);
      expect(manager.getActiveContextCount()).toBe(1);
    });
  });
});

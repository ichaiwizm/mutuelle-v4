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
    version: vi.fn().mockResolvedValue("1.0.0"),
    process: vi.fn().mockReturnValue({ pid: 1234 }),
  };

  return { mockBrowser, mockContexts };
};

let mocks: ReturnType<typeof createMocks>;

// Mock playwright-extra (not playwright)
vi.mock("playwright-extra", () => ({
  chromium: {
    use: vi.fn(),
    launch: vi.fn().mockImplementation(async () => mocks.mockBrowser),
  },
}));

vi.mock("puppeteer-extra-plugin-stealth", () => ({
  default: vi.fn().mockReturnValue({}),
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
      const { chromium } = await import("playwright-extra");
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

    it("auto-launches browser if not launched", async () => {
      // With refactored code, createContext auto-launches
      const context = await manager.createContext();
      expect(context).toBeDefined();
      expect(manager.isRunning()).toBe(true);
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

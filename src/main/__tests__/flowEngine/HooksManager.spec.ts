import { describe, it, expect, vi } from "vitest";
import { HooksManager } from "../../flows/engine/hooks";
import type { FlowHooks } from "../../flows/engine/types";

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

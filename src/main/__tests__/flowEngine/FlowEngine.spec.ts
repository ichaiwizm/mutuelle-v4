import { describe, it, expect, vi } from "vitest";
import { FlowEngine } from "../../flows/engine/FlowEngine";
import type { FlowHooks } from "../../flows/engine/types";

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

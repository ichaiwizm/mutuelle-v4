import { describe, it, expect } from "vitest";
import { StepRegistry } from "../../flows/engine/StepRegistry";

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

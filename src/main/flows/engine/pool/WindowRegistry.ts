/**
 * WindowRegistry - Facade for backward compatibility.
 *
 * This file re-exports from the modular window/ directory.
 * All existing imports continue to work unchanged.
 *
 * @see ./window/index.ts for the actual implementation
 */

export { windowRegistry, WindowRegistryImpl } from "./window";
export type { WindowStatus, WindowEntry } from "./window";

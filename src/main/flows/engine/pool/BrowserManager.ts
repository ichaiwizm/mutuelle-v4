/**
 * BrowserManager - Facade for backward compatibility.
 *
 * This file re-exports from the modular browser/ directory.
 * All existing imports continue to work unchanged.
 *
 * @see ./browser/index.ts for the actual implementation
 */

export { BrowserManager } from "./browser";
export type { CreateContextOptions } from "./browser";

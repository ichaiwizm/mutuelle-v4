/**
 * FlowWorker - Facade for backward compatibility.
 *
 * This file re-exports from the modular workers/ directory.
 * All existing imports continue to work unchanged.
 *
 * @see ./workers/index.ts for the actual implementation
 */

export { FlowWorker } from "./workers";
export type { OnManualCloseCallback } from "./workers";

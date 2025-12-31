/**
 * Flow Cache Handler
 * Handles flow cache invalidation
 */
import type { IpcMainInvokeEvent } from "electron";
import { flowSourceManager } from "./flow-source-manager-instance";

/**
 * Invalidate flow cache
 */
export async function handleFlowInvalidateCache(
  _e: IpcMainInvokeEvent,
  flowKey?: string
): Promise<{ success: boolean }> {
  if (flowKey) {
    flowSourceManager.invalidate(flowKey);
    console.log(`[flow-handlers] Cache invalidated for: ${flowKey}`);
  } else {
    flowSourceManager.clearCache();
    console.log("[flow-handlers] All cache cleared");
  }
  return { success: true };
}

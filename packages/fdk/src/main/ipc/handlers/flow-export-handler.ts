/**
 * Flow Export Handler
 * Handles flow export functionality
 */
import type { IpcMainInvokeEvent } from "electron";
import { flowSourceManager } from "./flow-source-manager-instance";
import { exportFlow, type ExportResult } from "../../export";

/**
 * Export a flow definition
 */
export async function handleFlowExport(
  _e: IpcMainInvokeEvent,
  flowKey: string
): Promise<ExportResult> {
  try {
    console.log(`[flow-handlers] Exporting flow: ${flowKey}`);
    const flowDef = flowSourceManager.loadFlow(flowKey);
    return exportFlow(flowDef);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      errors: [{ path: "", message, severity: "error" }],
      warnings: [],
    };
  }
}

// Re-export ExportResult type for convenience
export type { ExportResult } from "../../export";

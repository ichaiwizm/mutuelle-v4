/**
 * Flow List Handler
 * Handles flow listing, loading, and step/YAML retrieval
 */
import type { IpcMainInvokeEvent } from "electron";
import { flowSourceManager } from "./flow-source-manager-instance";
import type { FlowSource, UnifiedFlowInfo } from "../../loaders";

export interface FlowListParams {
  source?: FlowSource;
}

export interface FlowStepInfo {
  id: string;
  name: string;
  type: string;
  description?: string;
}

// Re-export for backwards compatibility
export type FlowInfo = UnifiedFlowInfo;

/**
 * List all available flows from files and/or database
 * Files are prioritary when source is "all"
 */
export async function handleFlowList(
  _e: IpcMainInvokeEvent,
  params?: FlowListParams
): Promise<UnifiedFlowInfo[]> {
  const source = params?.source ?? "all";
  console.log(`[flow-handlers] Listing flows (source: ${source})...`);
  const flows = flowSourceManager.listFlows(source);
  console.log(`[flow-handlers] Found ${flows.length} flows`);
  return flows;
}

/**
 * Load a specific flow by key
 */
export async function handleFlowLoad(
  _e: IpcMainInvokeEvent,
  flowKey: string
): Promise<{ success: boolean; flow?: UnifiedFlowInfo; source?: FlowSource; error?: string }> {
  try {
    console.log(`[flow-handlers] Loading flow: ${flowKey}`);
    const flows = flowSourceManager.listFlows("all");
    const flow = flows.find((f) => f.id === flowKey);

    if (!flow) {
      return { success: false, error: `Flow not found: ${flowKey}` };
    }

    const source = flowSourceManager.getFlowSource(flowKey);
    return { success: true, flow, source: source ?? undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[flow-handlers] Error loading flow: ${message}`);
    return { success: false, error: message };
  }
}

/**
 * Get flow steps for visualization
 */
export async function handleFlowGetSteps(
  _e: IpcMainInvokeEvent,
  flowKey: string
): Promise<{ success: boolean; steps?: FlowStepInfo[]; error?: string }> {
  try {
    console.log(`[flow-handlers] Getting steps for flow: ${flowKey}`);
    const steps = flowSourceManager.getFlowSteps(flowKey);
    return { success: true, steps };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[flow-handlers] Error getting steps: ${message}`);
    return { success: false, error: message };
  }
}

/**
 * Get YAML content for a flow
 */
export async function handleFlowGetYaml(
  _e: IpcMainInvokeEvent,
  flowKey: string
): Promise<{ success: boolean; yaml?: string; source?: FlowSource; error?: string }> {
  try {
    console.log(`[flow-handlers] Getting YAML for flow: ${flowKey}`);
    const yaml = flowSourceManager.getYamlContent(flowKey);
    const source = flowSourceManager.getFlowSource(flowKey);
    return { success: true, yaml, source: source ?? undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[flow-handlers] Error getting YAML: ${message}`);
    return { success: false, error: message };
  }
}

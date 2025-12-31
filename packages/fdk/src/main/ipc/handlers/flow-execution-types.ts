/**
 * Flow Execution Handler Types
 */
import type { FlowResult } from "@mutuelle/engine";

export interface RunFlowParams {
  flowKey: string;
  lead: Record<string, unknown>;
  credentials?: { username: string; password: string };
}

export interface RunFlowResult {
  success: boolean;
  result?: FlowResult;
  error?: string;
}

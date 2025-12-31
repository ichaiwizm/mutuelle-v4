/**
 * Flow Execution Handler
 * Handles flow execution (run) and stopping
 */
import type { IpcMainInvokeEvent } from "electron";
import { chromium } from "playwright-core";
import { YamlFlowEngine } from "@mutuelle/engine";
import { flowSourceManager } from "./flow-source-manager-instance";
import { getCredentials } from "../../db/credential-repository";
import { emitLog } from "./log-handlers";
import type { RunFlowParams, RunFlowResult } from "./flow-execution-types";
import {
  getActiveEngine, setActiveEngine,
  getActiveExecutionId, setActiveExecutionId,
  getActiveBrowser, setActiveBrowser, setActivePage,
  cleanupExecution,
} from "./flow-execution-state";
import { extractPlatform, logQueuedSteps, emitStepResults, emitResultLogs } from "./flow-execution-helpers";

export type { RunFlowParams, RunFlowResult };

export async function handleFlowRun(_e: IpcMainInvokeEvent, params: RunFlowParams): Promise<RunFlowResult> {
  const { flowKey, lead, credentials: providedCredentials } = params;

  try {
    emitLog({ timestamp: new Date().toISOString(), level: "info", message: `Loading flow: ${flowKey}` });
    const flowDef = flowSourceManager.loadFlow(flowKey);
    emitLog({ timestamp: new Date().toISOString(), level: "info", message: `Flow loaded: ${flowDef.metadata.name}` });

    const platform = extractPlatform(flowKey);
    let credentials = providedCredentials;
    if (!credentials || (!credentials.username && !credentials.password)) {
      const dbCreds = getCredentials(platform);
      if (dbCreds) {
        credentials = { username: dbCreds.username, password: dbCreds.password };
        emitLog({ timestamp: new Date().toISOString(), level: "info", message: `Using DB credentials for: ${platform}` });
      }
    }

    emitLog({ timestamp: new Date().toISOString(), level: "info", message: "Launching browser..." });
    const browser = await chromium.launch({ headless: false, slowMo: 100, args: ["--no-sandbox", "--disable-gpu"] });
    setActiveBrowser(browser);
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    setActivePage(page);
    emitLog({ timestamp: new Date().toISOString(), level: "info", message: "Browser ready, starting execution..." });

    const engine = new YamlFlowEngine();
    setActiveEngine(engine);
    logQueuedSteps(flowDef);

    const result = await engine.execute(flowDef, {
      page, lead, flowDef, credentials: credentials ?? { username: "", password: "" },
    });
    setActiveExecutionId(result.executionId);

    emitStepResults(flowDef, result);
    emitResultLogs(result);

    const level = result.status === "completed" ? "info" : "error";
    emitLog({ timestamp: new Date().toISOString(), level, message: `Flow execution ${result.status}` });
    return { success: true, result };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    emitLog({ timestamp: new Date().toISOString(), level: "error", message: `Flow error: ${errorMessage}` });
    return { success: false, error: errorMessage };
  } finally {
    await cleanupExecution();
  }
}

export async function handleFlowStop(_e: IpcMainInvokeEvent, executionId?: string): Promise<{ success: boolean; error?: string }> {
  const engine = getActiveEngine();
  const browser = getActiveBrowser();
  if (!engine && !browser) return { success: false, error: "No active execution to stop" };
  if (executionId && executionId !== getActiveExecutionId()) return { success: false, error: "Execution ID mismatch" };
  if (engine) engine.pause();
  await cleanupExecution();
  return { success: true };
}

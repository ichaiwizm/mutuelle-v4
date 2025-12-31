import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { getBundledChromiumPath } from "@/main/flows/engine/pool/browser/chromiumPath";

// Apply stealth plugin to avoid headless detection
chromium.use(StealthPlugin());

import type { FlowExecutionResult } from "../../flows/engine";
import { yamlEngineAdapter } from "../../flows/engine";
import { flowStateService } from "../../flows/state";
import { LeadsService } from "../leadsService";
import { NotFoundError, ValidationError } from "@/shared/errors";
import { convertFlowResult, getPlatformFromFlowKey } from "./flowResultConverter";

/**
 * Resume a paused flow state by its ID.
 * Creates a fresh Playwright browser/page, reloads lead + transformedData
 * and uses yamlEngineAdapter.resume().
 */
export async function resumeFlowState(stateId: string): Promise<FlowExecutionResult> {
  const state = await flowStateService.getState(stateId);
  if (!state) {
    throw new NotFoundError("FlowState", stateId);
  }
  if (state.status !== "paused") {
    throw new ValidationError(
      `Cannot resume flow state with status: ${state.status}`,
      { stateId, status: state.status }
    );
  }

  // Check if lead still exists before launching browser
  const lead = state.leadId ? await LeadsService.getById(state.leadId) : null;
  if (!lead) {
    await flowStateService.updateState(stateId, { status: "failed", completedAt: Date.now() });
    return {
      success: false,
      flowKey: state.flowKey,
      leadId: state.leadId ?? undefined,
      steps: [],
      totalDuration: 0,
      error: new Error(`Lead ${state.leadId} was deleted - cannot resume flow`),
    };
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: getBundledChromiumPath(),
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();

    // Extract platform from flow key for credentials lookup
    const platform = getPlatformFromFlowKey(state.flowKey);

    const flowResult = await yamlEngineAdapter.resume(stateId, {
      page,
      lead: lead as Record<string, unknown>,
      platform,
    });

    await context.close();
    return convertFlowResult(flowResult, state.flowKey, state.leadId ?? null);
  } finally {
    await browser.close();
  }
}

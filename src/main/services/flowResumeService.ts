import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Apply stealth plugin to avoid headless detection
chromium.use(StealthPlugin());

import { getBundledChromiumPath } from "@/main/flows/engine/pool/browser/chromiumPath";
import type { FlowExecutionResult } from "../flows/engine";
import { FlowEngine } from "../flows/engine";
import { flowStateService } from "../flows/state";
import { LeadsService } from "./leadsService";
import { hasTransformerForFlow, transformLeadForFlow } from "../flows/transformers";
import { NotFoundError, ValidationError } from "@/shared/errors";

/**
 * Resume a paused flow state by its ID.
 * Creates a fresh Playwright browser/page, reloads lead + transformedData and calls FlowEngine.resume.
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
    // Lead was deleted - mark flow state as failed and return error result
    await flowStateService.updateState(stateId, {
      status: "failed",
      completedAt: Date.now(),
    });
    return {
      success: false,
      flowKey: state.flowKey,
      leadId: state.leadId ?? undefined,
      steps: [],
      totalDuration: 0,
      error: new Error(`Lead ${state.leadId} was deleted - cannot resume flow`),
    };
  }

  const executablePath = getBundledChromiumPath();
  const browser = await chromium.launch({ headless: true, ignoreHTTPSErrors: true, executablePath });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();

    let transformedData: unknown;
    if (hasTransformerForFlow(state.flowKey)) {
      transformedData = transformLeadForFlow(state.flowKey, lead);
    }

    const result = await FlowEngine.resume(
      stateId,
      {
        page,
        lead,
        transformedData,
      },
      {
        // Use default environment-configured behaviors; allow capturing screenshots etc.
        verbose: true,
      }
    );

    await context.close();
    return result;
  } finally {
    await browser.close();
  }
}


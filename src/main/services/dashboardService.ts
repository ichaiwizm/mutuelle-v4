import { MailAuthService } from "./mailAuthService";
import { LeadsService } from "./leadsService";
import { AutomationService } from "./automation";
import { FlowsService } from "./flowsService";
import { ProductConfigQuery } from "./productConfig";
import { flowStateService } from "../flows/state";
import { CredentialsService } from "./credentials/credentialsService";
import type { DashboardOverview } from "@/shared/ipc/contracts";

/**
 * Safely execute a promise, returning a default value on error.
 */
async function safeCall<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

/**
 * Aggregated dashboard overview service.
 * Gathers high-level metrics for the application dashboard.
 * Individual service failures won't crash the entire dashboard.
 */
export async function getDashboardOverview(): Promise<DashboardOverview> {
  const [mailStatus, totalLeads, runsList, flows, pausedStates, activeProducts, configuredPlatforms] =
    await Promise.all([
      safeCall(MailAuthService.status(), { ok: false }),
      safeCall(LeadsService.count(), 0),
      safeCall(AutomationService.list({ limit: 5, offset: 0 }), { runs: [], total: 0 }),
      safeCall(FlowsService.list(), []),
      safeCall(flowStateService.getPausedFlows(), []),
      safeCall(ProductConfigQuery.listActiveProducts(), []),
      safeCall(CredentialsService.listPlatforms(), []),
    ]);

  return {
    mail: mailStatus,
    leads: { total: totalLeads },
    automation: {
      totalRuns: runsList.total,
      recentRuns: runsList.runs,
    },
    flows: {
      total: flows.length,
      items: flows,
    },
    flowStates: {
      pausedCount: pausedStates.length,
    },
    products: {
      activeCount: activeProducts.length,
      active: activeProducts,
    },
    credentials: {
      configuredCount: configuredPlatforms.length,
    },
  };
}


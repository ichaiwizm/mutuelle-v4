import { MailAuthService } from "./mailAuthService";
import { LeadsService } from "./leadsService";
import { AutomationService } from "./automationService";
import { FlowsService } from "./flowsService";
import { ProductConfigQuery } from "./productConfig";
import { flowStateService } from "../flows/state";
import type { DashboardOverview } from "@/shared/ipc/contracts";

/**
 * Aggregated dashboard overview service.
 * Gathers high-level metrics for the application dashboard.
 */
export async function getDashboardOverview(): Promise<DashboardOverview> {
  const [mailStatus, totalLeads, runsList, flows, pausedStates, activeProducts] =
    await Promise.all([
      MailAuthService.status(),
      LeadsService.count(),
      AutomationService.list({ limit: 5, offset: 0 }),
      FlowsService.list(),
      flowStateService.getPausedFlows(),
      ProductConfigQuery.listActiveProducts(),
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
  };
}


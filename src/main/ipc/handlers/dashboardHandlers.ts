import { ipcMain } from "electron";
import { IPC_CHANNEL } from "../channels";
import { getDashboardOverview } from "../../services/dashboardService";
import { simpleHandler } from "./utils";

export function registerDashboardHandlers() {
  ipcMain.handle(
    IPC_CHANNEL.DASHBOARD_OVERVIEW,
    simpleHandler(async () => {
      const overview = await getDashboardOverview();
      // Serialize for IPC transport (remove functions, convert dates)
      return {
        ...overview,
        automation: {
          ...overview.automation,
          recentRuns: overview.automation.recentRuns.map((run) => ({
            ...run,
            createdAt: run.createdAt instanceof Date
              ? run.createdAt.toISOString()
              : run.createdAt,
          })),
        },
        products: {
          ...overview.products,
          // Remove conditionalRules (functions) from product configs
          active: overview.products.active.map((p) => ({
            ...p,
            conditionalRules: undefined,
          })),
        },
      };
    })
  );
}

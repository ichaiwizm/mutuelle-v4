import { ipcMain, dialog, app } from "electron";
import { writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { IPC_CHANNEL } from "../channels";
import { simpleHandler, handler } from "./utils";
import { LeadsService } from "@/main/services/leadsService";
import { logger } from "@/main/services/logger";
import { resolveDbPath } from "@/main/db/db";
import { captureUserFeedback } from "@/main/services/monitoring";

/**
 * Data export handlers for backup functionality.
 */
export function registerDataHandlers() {
  /**
   * Export all leads to a JSON file.
   * Opens a save dialog and writes the leads data.
   */
  ipcMain.handle(
    IPC_CHANNEL.DATA_EXPORT_LEADS,
    simpleHandler(async () => {
      logger.info("Starting leads export", { service: "DATA_EXPORT" });

      // Get all leads
      const leads = await LeadsService.list({ limit: 10000, offset: 0 });

      if (leads.length === 0) {
        return { exported: false, reason: "NO_LEADS" };
      }

      // Prepare export data
      const exportData = {
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        count: leads.length,
        leads: leads.map((lead) => ({
          id: lead.id,
          subscriber: lead.subscriber,
          project: lead.project,
          children: lead.children,
          source: lead.source,
          createdAt: lead.createdAt,
        })),
      };

      // Open save dialog
      const { filePath, canceled } = await dialog.showSaveDialog({
        title: "Exporter les leads",
        defaultPath: `mutuelle-leads-${new Date().toISOString().split("T")[0]}.json`,
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      if (canceled || !filePath) {
        return { exported: false, reason: "CANCELLED" };
      }

      // Write file
      await writeFile(filePath, JSON.stringify(exportData, null, 2), "utf-8");

      logger.info(`Exported ${leads.length} leads to ${filePath}`, {
        service: "DATA_EXPORT",
      });

      return { exported: true, path: filePath, count: leads.length };
    }, "data:exportLeads")
  );

  /**
   * Export the entire database file.
   * Creates a copy of the SQLite database.
   */
  ipcMain.handle(
    IPC_CHANNEL.DATA_EXPORT_DB,
    simpleHandler(async () => {
      logger.info("Starting database export", { service: "DATA_EXPORT" });

      const dbPath = resolveDbPath();

      // Open save dialog
      const { filePath, canceled } = await dialog.showSaveDialog({
        title: "Sauvegarder la base de données",
        defaultPath: `mutuelle-backup-${new Date().toISOString().split("T")[0]}.db`,
        filters: [{ name: "SQLite Database", extensions: ["db"] }],
      });

      if (canceled || !filePath) {
        return { exported: false, reason: "CANCELLED" };
      }

      // Copy database file
      await copyFile(dbPath, filePath);

      logger.info(`Exported database to ${filePath}`, { service: "DATA_EXPORT" });

      return { exported: true, path: filePath };
    }, "data:exportDb")
  );

  /**
   * Get the path to the logs directory.
   */
  ipcMain.handle(
    IPC_CHANNEL.DATA_GET_LOGS_PATH,
    simpleHandler(async () => {
      const logsPath = path.join(app.getPath("logs"));
      return { path: logsPath };
    }, "data:getLogsPath")
  );

  /**
   * Send user feedback via Sentry.
   */
  ipcMain.handle(
    IPC_CHANNEL.FEEDBACK_SEND,
    handler(
      null,
      async (payload: { message: string; email?: string; name?: string }) => {
        logger.info("Sending user feedback", { service: "FEEDBACK" });
        const sent = captureUserFeedback(payload);
        return { sent };
      },
      "feedback:send"
    )
  );
}

import { ipcMain, app } from "electron";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { IPC_CHANNEL } from "../channels";
import { handler } from "./utils";
import { getRun } from "@/main/services/automation/runManager";
import { logger } from "@/main/services/logger";
import { captureSupportRequest } from "@/main/services/monitoring";
import type { SupportLogResult } from "@/shared/types/support";

// Validation schema
const SupportSendLogsSchema = z.object({
  runId: z.string().uuid(),
  userMessage: z.string().max(2000).optional(),
});

// Limits to stay under Sentry's 20MB max
const MAX_LOG_SIZE = 100 * 1024; // 100KB
const MAX_SCREENSHOTS = 5;
const MAX_SCREENSHOT_SIZE = 500 * 1024; // 500KB per screenshot

export function registerSupportHandlers() {
  ipcMain.handle(
    IPC_CHANNEL.SUPPORT_SEND_LOGS,
    handler(SupportSendLogsSchema, async (payload): Promise<SupportLogResult> => {
      logger.info("Collecting support data for run " + payload.runId.slice(0, 8), {
        service: "SUPPORT",
      });

      try {
        // 1. Get the run data
        const run = await getRun(payload.runId);
        if (!run) {
          return { sent: false, error: "Run not found" };
        }

        // 2. Collect system info
        const systemInfo = {
          platform: process.platform,
          arch: process.arch,
          appVersion: app.getVersion(),
          electronVersion: process.versions.electron,
          nodeVersion: process.versions.node,
        };

        // 3. Prepare run data for the report
        const runData = {
          id: run.id,
          status: run.status,
          createdAt: run.createdAt,
          itemsCount: run.items.length,
          failedCount: run.items.filter((i) => i.status === "failed").length,
          items: run.items.map((item) => ({
            id: item.id,
            flowKey: item.flowKey,
            leadId: item.leadId,
            leadName: item.leadName,
            status: item.status,
            stepsData: item.stepsData,
            errorMessage: item.errorMessage,
          })),
        };

        // 4. Collect screenshots (limited in size and count)
        const screenshots: Array<{ filename: string; data: Buffer }> = [];

        for (const item of run.items) {
          if (screenshots.length >= MAX_SCREENSHOTS) break;

          const steps = item.stepsData?.steps || [];
          for (const step of steps) {
            if (!step.screenshot || screenshots.length >= MAX_SCREENSHOTS) continue;

            const screenshotPath = path.join(item.artifactsDir, step.screenshot);
            if (existsSync(screenshotPath)) {
              try {
                const buffer = await readFile(screenshotPath);
                // Skip if too large
                if (buffer.length > MAX_SCREENSHOT_SIZE) {
                  logger.debug("Screenshot too large, skipping", {
                    service: "SUPPORT",
                    path: screenshotPath,
                    size: buffer.length,
                  });
                  continue;
                }

                screenshots.push({
                  filename: `${item.flowKey}-${step.id}.png`,
                  data: buffer,
                });
              } catch {
                logger.warn("Failed to read screenshot: " + screenshotPath, { service: "SUPPORT" });
              }
            }
          }
        }

        // 5. Get the last logs from main.log
        let logs = "";
        const logPath = logger.getLogPath();
        if (logPath && existsSync(logPath)) {
          try {
            const logBuffer = await readFile(logPath);
            // Take the last MAX_LOG_SIZE bytes
            logs = logBuffer.slice(-MAX_LOG_SIZE).toString("utf-8");
          } catch {
            logger.warn("Failed to read logs: " + logPath, { service: "SUPPORT" });
          }
        }

        // 6. Prepare attachments for Sentry
        const attachments = [
          // JSON with all structured data
          {
            filename: "run-data.json",
            data: Buffer.from(JSON.stringify(runData, null, 2)),
            contentType: "application/json",
          },
          // Application logs
          {
            filename: "main.log",
            data: Buffer.from(logs),
            contentType: "text/plain",
          },
          // Screenshots
          ...screenshots.map((s) => ({
            filename: s.filename,
            data: s.data,
            contentType: "image/png",
          })),
        ];

        // 7. Send to Sentry
        const eventId = captureSupportRequest(
          `Support request for run ${run.id.slice(0, 8)}`,
          {
            runData,
            systemInfo,
            userMessage: payload.userMessage,
          },
          attachments
        );

        logger.info("Support data sent", {
          service: "SUPPORT",
          eventId,
          attachmentsCount: attachments.length,
        });

        return { sent: !!eventId, eventId };
      } catch (err) {
        logger.error("Failed to send support data", { service: "SUPPORT" }, err);
        return {
          sent: false,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    }, "support:sendLogs")
  );
}

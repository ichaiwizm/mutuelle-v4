import { ipcMain } from "electron";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { IPC_CHANNEL } from "../channels";
import { AutomationService } from "../../services/automation";
import { ValidationError } from "@/shared/errors";
import {
  AutomationEnqueueSchema,
  AutomationGetSchema,
  AutomationListSchema,
  AutomationCancelSchema,
  AutomationGetItemSchema,
  AutomationRetryItemSchema,
  AutomationReadScreenshotSchema,
  AutomationBringToFrontSchema,
} from "@/shared/validation/ipc.zod";
import { handler } from "./utils";
import { windowRegistry } from "@/main/flows/engine/pool/WindowRegistry";

export function registerAutomationHandlers() {
  ipcMain.handle(
    IPC_CHANNEL.AUTO_ENQUEUE,
    handler(AutomationEnqueueSchema, async ({ items }) => {
      return AutomationService.enqueue(items);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.AUTO_GET,
    handler(AutomationGetSchema, async ({ runId }) => {
      return AutomationService.get(runId);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.AUTO_LIST,
    handler(AutomationListSchema, async (options) => {
      return AutomationService.list(options ?? undefined);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.AUTO_CANCEL,
    handler(AutomationCancelSchema, async ({ runId }) => {
      return AutomationService.cancel(runId);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.AUTO_GET_ITEM,
    handler(AutomationGetItemSchema, async ({ itemId }) => {
      return AutomationService.getItem(itemId);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.AUTO_READ_SCREENSHOT,
    handler(AutomationReadScreenshotSchema, async ({ path }) => {
      if (!existsSync(path)) {
        throw new ValidationError(`Screenshot not found: ${path}`);
      }
      const buffer = await readFile(path);
      return `data:image/png;base64,${buffer.toString("base64")}`;
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.AUTO_DELETE,
    handler(AutomationCancelSchema, async ({ runId }) => {
      return AutomationService.delete(runId);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.AUTO_RETRY,
    handler(AutomationCancelSchema, async ({ runId }) => {
      return AutomationService.retry(runId);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.AUTO_RETRY_ITEM,
    handler(AutomationRetryItemSchema, async ({ itemId }) => {
      return AutomationService.retryItem(itemId);
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.AUTO_BRING_TO_FRONT,
    handler(AutomationBringToFrontSchema, async ({ itemId }) => {
      console.log(`[IPC] AUTO_BRING_TO_FRONT called for item ${itemId.substring(0, 8)}...`);
      const success = await windowRegistry.bringToFront(itemId);
      return { success };
    })
  );
}

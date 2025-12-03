import { ipcMain } from "electron";
import { IPC_CHANNEL } from "../channels";
import { AutomationSettingsService } from "../../services/automationSettingsService";
import {
  AutomationSettingsGetSchema,
  AutomationSettingsSaveSchema,
} from "@/shared/validation/automation.zod";
import { handler, simpleHandler } from "./utils";

export function registerAutomationSettingsHandlers() {
  console.log("[AutomationSettings] Registering handlers...");

  ipcMain.handle(
    IPC_CHANNEL.AUTO_SETTINGS_GET,
    handler(AutomationSettingsGetSchema, async ({ flowKey }) => {
      console.log("[AutomationSettings] GET", flowKey);
      const result = await AutomationSettingsService.get(flowKey);
      console.log("[AutomationSettings] GET result:", result);
      return result;
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.AUTO_SETTINGS_LIST,
    simpleHandler(async () => {
      console.log("[AutomationSettings] LIST");
      const result = await AutomationSettingsService.list();
      console.log("[AutomationSettings] LIST result:", result);
      return result;
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.AUTO_SETTINGS_SAVE,
    handler(AutomationSettingsSaveSchema, async ({ flowKey, headless, stopAtStep }) => {
      console.log("[AutomationSettings] SAVE", { flowKey, headless, stopAtStep });
      const result = await AutomationSettingsService.upsert(flowKey, { headless, stopAtStep });
      console.log("[AutomationSettings] SAVE result:", result);
      return result;
    })
  );
}

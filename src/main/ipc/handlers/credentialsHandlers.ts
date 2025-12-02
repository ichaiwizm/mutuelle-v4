import { ipcMain } from "electron";
import { IPC_CHANNEL } from "../channels";
import { CredentialsService } from "../../services/credentials";
import {
  CredentialsUpsertSchema,
  CredentialsGetSchema,
  CredentialsDeleteSchema,
  CredentialsTestSchema,
} from "@/shared/validation/ipc.zod";
import { handler, simpleHandler } from "./utils";

export function registerCredentialsHandlers() {
  ipcMain.handle(
    IPC_CHANNEL.CREDS_UPSERT,
    handler(CredentialsUpsertSchema, async (creds) => {
      await CredentialsService.upsert(creds);
      return { saved: true };
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.CREDS_GET,
    handler(CredentialsGetSchema, async ({ platform }) => {
      const creds = await CredentialsService.getByPlatform(platform);
      // Don't return password to frontend - just confirm it exists
      if (!creds) return null;
      return { platform: creds.platform, login: creds.login, hasPassword: true };
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.CREDS_LIST,
    simpleHandler(async () => {
      return CredentialsService.listPlatforms();
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.CREDS_DELETE,
    handler(CredentialsDeleteSchema, async ({ platform }) => {
      await CredentialsService.delete(platform);
      return { deleted: true };
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.CREDS_TEST,
    handler(CredentialsTestSchema, async ({ platform }) => {
      return CredentialsService.test(platform);
    })
  );
}

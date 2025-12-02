import { ipcMain } from "electron";
import { IPC_CHANNEL } from "../channels";
import { MailAuthService } from "../../services/mailAuthService";
import { MailService } from "../../services/mailService";
import { OAuthService } from "../../services/oauth";
import { AppError, success, toIpcResult } from "@/shared/errors";
import { MailFetchSchema } from "@/shared/validation/ipc.zod";
import { handler, simpleHandler } from "./utils";

export function registerMailHandlers() {
  ipcMain.handle(
    IPC_CHANNEL.MAIL_STATUS,
    simpleHandler(() => MailAuthService.status())
  );

  ipcMain.handle(IPC_CHANNEL.MAIL_CONNECT, async () => {
    try {
      const result = await OAuthService.connect();
      if (result.ok) {
        return success({ email: result.email });
      }
      return { ok: false, error: { code: "AUTH", message: result.error || "OAuth authentication failed" } };
    } catch (err) {
      return toIpcResult(err);
    }
  });

  ipcMain.handle(IPC_CHANNEL.MAIL_DISCONNECT, async () => {
    try {
      await OAuthService.disconnect();
      return success({ disconnected: true });
    } catch (err) {
      return toIpcResult(err);
    }
  });

  ipcMain.handle(
    IPC_CHANNEL.MAIL_FETCH,
    handler(MailFetchSchema, async ({ days, verbose, concurrency }) => {
      return MailService.fetch(days, undefined, { verbose, concurrency });
    })
  );

  ipcMain.handle(IPC_CHANNEL.MAIL_CANCEL, async () => {
    MailService.abortFetch();
    return success({ cancelled: true });
  });

  ipcMain.handle(IPC_CHANNEL.MAIL_IS_CONNECTING, async () => {
    return success({ isConnecting: OAuthService.isFlowActive() });
  });

  ipcMain.handle(IPC_CHANNEL.MAIL_CANCEL_CONNECT, async () => {
    OAuthService.cancelFlow();
    return success({ cancelled: true });
  });
}

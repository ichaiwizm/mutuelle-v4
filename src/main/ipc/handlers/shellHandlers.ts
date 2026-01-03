import { ipcMain, shell } from "electron";
import { IPC_CHANNEL } from "../channels";
import { AppError, ValidationError } from "@/shared/errors";
import { handler } from "./utils";

export function registerShellHandlers() {
  ipcMain.handle(
    IPC_CHANNEL.SHELL_OPEN_PATH,
    handler(null, async (input: { path: string }) => {
      const { path } = input as { path: string };
      if (!path || typeof path !== "string") {
        throw new ValidationError("Path is required");
      }
      // shell.openPath returns an empty string on success, or an error message
      const errorMessage = await shell.openPath(path);
      if (errorMessage) {
        throw new AppError("UNKNOWN", `Failed to open path: ${errorMessage}`);
      }
      return { success: true };
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.SHELL_OPEN_EXTERNAL,
    handler(null, async (input: { url: string }) => {
      const { url } = input as { url: string };
      if (!url || typeof url !== "string") {
        throw new ValidationError("URL is required");
      }
      await shell.openExternal(url);
      return { success: true };
    })
  );
}

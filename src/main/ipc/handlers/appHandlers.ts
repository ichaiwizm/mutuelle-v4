import { app, ipcMain } from "electron";
import { IPC_CHANNEL } from "../channels";
import { simpleHandler } from "./utils";

export function registerAppHandlers() {
  ipcMain.handle(
    IPC_CHANNEL.APP_GET_VERSION,
    simpleHandler(async () => {
      return { version: app.getVersion() };
    }, "app:getVersion")
  );
}

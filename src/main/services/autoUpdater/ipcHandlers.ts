import { autoUpdater } from "electron-updater";
import { ipcMain } from "electron";
import { IPC_CHANNEL } from "@/main/ipc/channels";
import { sendUpdateStatus } from "./statusSender";

export function setupAutoUpdaterIpc(): void {
  ipcMain.handle(IPC_CHANNEL.UPDATE_CHECK, async () => {
    console.log("[AUTO_UPDATE] Manual check requested by renderer");
    sendUpdateStatus({ state: "checking" });
    await autoUpdater.checkForUpdates();
  });

  ipcMain.handle(IPC_CHANNEL.UPDATE_DOWNLOAD, async () => {
    console.log("[AUTO_UPDATE] Download requested by renderer");
    await autoUpdater.downloadUpdate();
  });

  ipcMain.handle(IPC_CHANNEL.UPDATE_INSTALL, () => {
    console.log("[AUTO_UPDATE] Install requested by renderer");
    autoUpdater.quitAndInstall();
  });
}

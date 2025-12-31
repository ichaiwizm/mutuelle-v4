import { BrowserWindow } from "electron";
import { IPC_CHANNEL } from "@/main/ipc/channels";
import type { UpdateStatus } from "@/shared/ipc/contracts";

let mainWindow: BrowserWindow | null = null;

export function setMainWindow(win: BrowserWindow): void {
  mainWindow = win;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function sendUpdateStatus(status: UpdateStatus): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNEL.UPDATE_STATUS, status);
  }
  console.log("[AUTO_UPDATE]", status.state, status);
}

export function setProgressBar(value: number): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setProgressBar(value);
  }
}

import { autoUpdater } from "electron-updater";
import { BrowserWindow } from "electron";
import { setMainWindow, sendUpdateStatus } from "./statusSender";
import { setupAutoUpdaterEvents } from "./eventHandlers";
import { setupAutoUpdaterIpc } from "./ipcHandlers";

/**
 * Service de mise a jour automatique via GitHub Releases.
 * Envoie les evenements au renderer via IPC pour une UI custom.
 */
export function initAutoUpdater(win: BrowserWindow): void {
  setMainWindow(win);
  console.log("[AUTO_UPDATE] Initializing auto-updater service");

  if (process.env.ELECTRON_RENDERER_URL) {
    console.log("[AUTO_UPDATE] Skipped in development mode");
    return;
  }

  autoUpdater.logger = {
    info: (msg) => console.log("[AUTO_UPDATE]", msg),
    warn: (msg) => console.warn("[AUTO_UPDATE]", msg),
    error: (msg) => console.error("[AUTO_UPDATE]", msg),
    debug: (msg) => console.log("[AUTO_UPDATE:DEBUG]", msg),
  };

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  setupAutoUpdaterEvents();
  setupAutoUpdaterIpc();

  setTimeout(() => {
    console.log("[AUTO_UPDATE] Checking for updates...");
    sendUpdateStatus({ state: "checking" });
    autoUpdater.checkForUpdates().catch((err) => {
      console.error("[AUTO_UPDATE] Check failed:", err);
      sendUpdateStatus({ state: "error", message: err.message });
    });
  }, 3000);
}

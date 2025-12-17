import { autoUpdater } from "electron-updater";
import { BrowserWindow, ipcMain } from "electron";
import { IPC_CHANNEL } from "@/main/ipc/channels";
import type { UpdateStatus } from "@/shared/ipc/contracts";

/**
 * Service de mise à jour automatique via GitHub Releases.
 * Envoie les événements au renderer via IPC pour une UI custom.
 */

let mainWindow: BrowserWindow | null = null;
let currentVersion: string | null = null;

function sendUpdateStatus(status: UpdateStatus): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNEL.UPDATE_STATUS, status);
  }
  console.log("[AUTO_UPDATE]", status.state, status);
}

export function initAutoUpdater(win: BrowserWindow): void {
  mainWindow = win;
  console.log("[AUTO_UPDATE] Initializing auto-updater service");
  console.log("[AUTO_UPDATE] mainWindow available:", !!mainWindow);

  // Désactive en dev (pas de releases à checker)
  if (process.env.ELECTRON_RENDERER_URL) {
    console.log("[AUTO_UPDATE] Skipped in development mode");
    return;
  }

  // Configure le logger
  autoUpdater.logger = {
    info: (msg) => console.log("[AUTO_UPDATE]", msg),
    warn: (msg) => console.warn("[AUTO_UPDATE]", msg),
    error: (msg) => console.error("[AUTO_UPDATE]", msg),
    debug: (msg) => console.log("[AUTO_UPDATE:DEBUG]", msg),
  };

  // Ne pas télécharger automatiquement, on veut contrôler le flow
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  console.log("[AUTO_UPDATE] Config: autoDownload =", autoUpdater.autoDownload, "| autoInstallOnAppQuit =", autoUpdater.autoInstallOnAppQuit);

  // Event: une update est disponible
  autoUpdater.on("update-available", (info) => {
    currentVersion = info.version;
    console.log("[AUTO_UPDATE] Update available:", info.version);
    sendUpdateStatus({ state: "available", version: info.version });
  });

  // Event: pas d'update
  autoUpdater.on("update-not-available", () => {
    console.log("[AUTO_UPDATE] No update available");
    sendUpdateStatus({ state: "not-available" });
  });

  // Event: progression du téléchargement
  autoUpdater.on("download-progress", (progress) => {
    console.log(`[AUTO_UPDATE] Download progress: ${Math.round(progress.percent)}%`);

    // Barre de progression dans la taskbar
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setProgressBar(progress.percent / 100);
    }

    sendUpdateStatus({
      state: "downloading",
      percent: Math.round(progress.percent),
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  // Event: téléchargement terminé
  autoUpdater.on("update-downloaded", (info) => {
    console.log("[AUTO_UPDATE] Update downloaded:", info.version);

    // Reset la barre de progression
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setProgressBar(-1);
    }

    sendUpdateStatus({ state: "ready", version: info.version });
  });

  // Event: erreur
  autoUpdater.on("error", (err) => {
    console.error("[AUTO_UPDATE] Error:", err);

    // Reset la barre de progression en cas d'erreur
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setProgressBar(-1);
    }

    sendUpdateStatus({ state: "error", message: err.message });
  });

  // IPC Handler: vérifier les mises à jour manuellement
  ipcMain.handle(IPC_CHANNEL.UPDATE_CHECK, async () => {
    console.log("[AUTO_UPDATE] Manual check requested by renderer");
    sendUpdateStatus({ state: "checking" });
    await autoUpdater.checkForUpdates();
  });

  // IPC Handler: lancer le téléchargement
  ipcMain.handle(IPC_CHANNEL.UPDATE_DOWNLOAD, async () => {
    console.log("[AUTO_UPDATE] Download requested by renderer");
    await autoUpdater.downloadUpdate();
  });

  // IPC Handler: installer et redémarrer
  ipcMain.handle(IPC_CHANNEL.UPDATE_INSTALL, () => {
    console.log("[AUTO_UPDATE] Install requested by renderer");
    autoUpdater.quitAndInstall();
  });

  // Vérifie les updates au démarrage (après un court délai pour ne pas bloquer le lancement)
  setTimeout(() => {
    console.log("[AUTO_UPDATE] Checking for updates...");
    sendUpdateStatus({ state: "checking" });
    autoUpdater.checkForUpdates().catch((err) => {
      console.error("[AUTO_UPDATE] Check failed:", err);
      sendUpdateStatus({ state: "error", message: err.message });
    });
  }, 3000);
}

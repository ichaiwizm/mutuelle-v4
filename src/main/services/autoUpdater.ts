import { autoUpdater } from "electron-updater";
import { app, BrowserWindow, dialog } from "electron";

/**
 * Service de mise à jour automatique via GitHub Releases.
 * Vérifie les updates au démarrage et propose de redémarrer quand une update est prête.
 */
export function initAutoUpdater(): void {
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

  // Event: une update est disponible
  autoUpdater.on("update-available", async (info) => {
    console.log("[AUTO_UPDATE] Update available:", info.version);

    const { response } = await dialog.showMessageBox({
      type: "info",
      title: "Mise à jour disponible",
      message: `Une nouvelle version (${info.version}) est disponible.`,
      detail: "Voulez-vous la télécharger maintenant ?",
      buttons: ["Télécharger", "Plus tard"],
      defaultId: 0,
    });

    if (response === 0) {
      autoUpdater.downloadUpdate();
    }
  });

  // Event: pas d'update
  autoUpdater.on("update-not-available", () => {
    console.log("[AUTO_UPDATE] No update available");
  });

  // Event: progression du téléchargement
  autoUpdater.on("download-progress", (progress) => {
    console.log(`[AUTO_UPDATE] Download progress: ${Math.round(progress.percent)}%`);

    // Optionnel: notifier le renderer pour afficher une barre de progression
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.setProgressBar(progress.percent / 100);
    }
  });

  // Event: téléchargement terminé
  autoUpdater.on("update-downloaded", async (info) => {
    console.log("[AUTO_UPDATE] Update downloaded:", info.version);

    // Reset la barre de progression
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.setProgressBar(-1);
    }

    const { response } = await dialog.showMessageBox({
      type: "info",
      title: "Mise à jour prête",
      message: `La version ${info.version} a été téléchargée.`,
      detail: "L'application va redémarrer pour appliquer la mise à jour.",
      buttons: ["Redémarrer maintenant", "Plus tard"],
      defaultId: 0,
    });

    if (response === 0) {
      autoUpdater.quitAndInstall();
    }
  });

  // Event: erreur
  autoUpdater.on("error", (err) => {
    console.error("[AUTO_UPDATE] Error:", err);
  });

  // Vérifie les updates au démarrage (après un court délai pour ne pas bloquer le lancement)
  setTimeout(() => {
    console.log("[AUTO_UPDATE] Checking for updates...");
    autoUpdater.checkForUpdates().catch((err) => {
      console.error("[AUTO_UPDATE] Check failed:", err);
    });
  }, 3000);
}

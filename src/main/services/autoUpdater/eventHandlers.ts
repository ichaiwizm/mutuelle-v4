import { autoUpdater } from "electron-updater";
import { sendUpdateStatus, setProgressBar } from "./statusSender";

export function setupAutoUpdaterEvents(): void {
  autoUpdater.on("update-available", (info) => {
    console.log("[AUTO_UPDATE] Update available:", info.version);
    sendUpdateStatus({ state: "available", version: info.version });
  });

  autoUpdater.on("update-not-available", () => {
    console.log("[AUTO_UPDATE] No update available");
    sendUpdateStatus({ state: "not-available" });
  });

  autoUpdater.on("download-progress", (progress) => {
    console.log(`[AUTO_UPDATE] Download progress: ${Math.round(progress.percent)}%`);
    setProgressBar(progress.percent / 100);
    sendUpdateStatus({
      state: "downloading",
      percent: Math.round(progress.percent),
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    console.log("[AUTO_UPDATE] Update downloaded:", info.version);
    setProgressBar(-1);
    sendUpdateStatus({ state: "ready", version: info.version });
  });

  autoUpdater.on("error", (err) => {
    console.error("[AUTO_UPDATE] Error:", err);
    setProgressBar(-1);
    sendUpdateStatus({ state: "error", message: err.message });
  });
}

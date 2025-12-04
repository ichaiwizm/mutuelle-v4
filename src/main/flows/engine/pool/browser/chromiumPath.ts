import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Get the path to the bundled Chromium executable (production only).
 * In dev, returns undefined to let Playwright use its default.
 *
 * Chromium is bundled via extraResources in package.json.
 * The executable path differs by OS:
 * - macOS:   chromium-XXXX/chrome-mac/Chromium.app/Contents/MacOS/Chromium
 * - Windows: chromium-XXXX/chrome-win/chrome.exe
 * - Linux:   chromium-XXXX/chrome-linux/chrome
 */
export function getBundledChromiumPath(): string | undefined {
  const isDev = !!process.env.ELECTRON_RENDERER_URL;
  if (isDev) return undefined;

  try {
    const browsersDir = join(process.resourcesPath, "playwright-browsers");

    if (!existsSync(browsersDir)) {
      console.error("[CHROMIUM] Browsers directory not found:", browsersDir);
      return undefined;
    }

    const entries = readdirSync(browsersDir);
    const chromiumFolder = entries.find((e) => e.startsWith("chromium-"));

    if (!chromiumFolder) {
      console.error("[CHROMIUM] No chromium folder found in", browsersDir);
      return undefined;
    }

    const chromiumBase = join(browsersDir, chromiumFolder);
    const execPath = getChromiumExecutablePath(chromiumBase);

    if (!execPath) {
      console.error("[CHROMIUM] Could not determine executable path for platform:", process.platform);
      return undefined;
    }

    if (!existsSync(execPath)) {
      console.error("[CHROMIUM] Executable not found at:", execPath);
      return undefined;
    }

    console.log("[CHROMIUM] Using bundled Chromium:", execPath);
    return execPath;
  } catch (err) {
    console.error("[CHROMIUM] Error finding bundled Chromium:", err);
    return undefined;
  }
}

/**
 * Get the platform-specific path to the Chromium executable.
 */
function getChromiumExecutablePath(chromiumBase: string): string | undefined {
  switch (process.platform) {
    case "darwin":
      // macOS: chrome-mac/Chromium.app/Contents/MacOS/Chromium
      return join(chromiumBase, "chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium");

    case "win32":
      // Windows: chrome-win/chrome.exe
      return join(chromiumBase, "chrome-win", "chrome.exe");

    case "linux":
      // Linux: chrome-linux/chrome
      return join(chromiumBase, "chrome-linux", "chrome");

    default:
      return undefined;
  }
}

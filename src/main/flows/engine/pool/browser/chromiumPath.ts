import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Get the path to the bundled Chromium executable (production only).
 * In dev, returns undefined to let Playwright use its default.
 *
 * Since Playwright 1.46+, headless mode uses chromium_headless_shell.
 * This function prioritizes the headless shell, with fallback to regular Chromium.
 */
export function getBundledChromiumPath(): string | undefined {
  if (process.env.ELECTRON_RENDERER_URL) return undefined; // Dev mode

  try {
    const browsersDir = join(process.resourcesPath, "playwright-browsers");
    if (!existsSync(browsersDir)) {
      console.error("[CHROMIUM] Browsers directory not found:", browsersDir);
      return undefined;
    }

    const entries = readdirSync(browsersDir);

    // Priority 1: Headless shell (required for headless: true since Playwright 1.46+)
    const headlessFolder = entries.find((e) => e.startsWith("chromium_headless_shell-"));
    if (headlessFolder) {
      const path = getHeadlessShellPath(join(browsersDir, headlessFolder));
      if (path && existsSync(path)) {
        console.log("[CHROMIUM] Using bundled headless shell:", path);
        return path;
      }
    }

    // Priority 2: Regular Chromium
    const chromiumFolder = entries.find((e) => e.startsWith("chromium-"));
    if (chromiumFolder) {
      const path = getChromiumPath(join(browsersDir, chromiumFolder));
      if (path && existsSync(path)) {
        console.log("[CHROMIUM] Using bundled Chromium:", path);
        return path;
      }
    }

    console.error("[CHROMIUM] No valid browser found in", browsersDir);
    return undefined;
  } catch (err) {
    console.error("[CHROMIUM] Error finding bundled browser:", err);
    return undefined;
  }
}

/** Get headless shell path for current platform */
function getHeadlessShellPath(baseDir: string): string | undefined {
  const paths: Record<string, string[]> = {
    darwin: [
      join(baseDir, "chrome-headless-shell-mac-arm64", "chrome-headless-shell"),
      join(baseDir, "chrome-headless-shell-mac-x64", "chrome-headless-shell"),
    ],
    win32: [
      join(baseDir, "chrome-headless-shell-win64", "chrome-headless-shell.exe"),
      join(baseDir, "chrome-headless-shell-win32", "chrome-headless-shell.exe"),
    ],
    linux: [join(baseDir, "chrome-headless-shell-linux64", "chrome-headless-shell")],
  };
  return findFirst(paths[process.platform]);
}

/** Get regular Chromium path for current platform */
function getChromiumPath(baseDir: string): string | undefined {
  const paths: Record<string, string[]> = {
    darwin: [join(baseDir, "chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium")],
    win32: [
      join(baseDir, "chrome-win64", "chrome.exe"),
      join(baseDir, "chrome-win", "chrome.exe"),
    ],
    linux: [
      join(baseDir, "chrome-linux64", "chrome"),
      join(baseDir, "chrome-linux", "chrome"),
    ],
  };
  return findFirst(paths[process.platform]);
}

/** Return first existing path or first candidate */
function findFirst(candidates?: string[]): string | undefined {
  if (!candidates?.length) return undefined;
  return candidates.find((p) => existsSync(p)) ?? candidates[0];
}

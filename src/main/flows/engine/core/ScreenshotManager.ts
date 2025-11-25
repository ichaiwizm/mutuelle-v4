import type { Page } from "playwright";
import type { FlowLogger } from "../FlowLogger";
import { mkdirSync } from "fs";

type ScreenshotOptions = {
  page: Page;
  artifactsDir?: string;
  stepId: string;
  type: "error" | "success";
  logger: FlowLogger;
};

// Répertoire par défaut pour les screenshots
const DEFAULT_SCREENSHOTS_DIR = "./e2e/test-results/screenshots";

/**
 * Handles screenshot capture for steps
 */
export async function captureScreenshot(options: ScreenshotOptions): Promise<void> {
  const { page, artifactsDir, stepId, type, logger } = options;

  try {
    // Utiliser artifactsDir ou le répertoire par défaut
    const screenshotsDir = artifactsDir || DEFAULT_SCREENSHOTS_DIR;

    // Créer le répertoire s'il n'existe pas
    mkdirSync(screenshotsDir, { recursive: true });

    const path = `${screenshotsDir}/screenshot-${type}-${stepId}-${Date.now()}.png`;
    await page.screenshot({ path, fullPage: true });
    logger.info(`Screenshot saved: ${path}`, { screenshotPath: path });
  } catch (err) {
    logger.warn(`Failed to take screenshot: ${err}`);
  }
}

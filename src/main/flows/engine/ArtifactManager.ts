import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import type { Page } from 'playwright';

/**
 * Manages artifacts (screenshots, videos, result files) for a run item.
 */
export class ArtifactManager {
  private artifactsDir: string;

  constructor(artifactsDir: string) {
    this.artifactsDir = artifactsDir;
  }

  /**
   * Initialize artifacts directory
   */
  async initialize(): Promise<void> {
    await mkdir(this.artifactsDir, { recursive: true });
  }

  /**
   * Get artifacts directory path
   */
  getArtifactsDir(): string {
    return this.artifactsDir;
  }

  /**
   * Take screenshot and save to artifacts
   */
  async screenshot(
    page: Page,
    name: string,
    fullPage: boolean = true
  ): Promise<string> {
    const filename = `${name}.png`;
    const path = join(this.artifactsDir, filename);
    await page.screenshot({ path, fullPage });
    return path;
  }

  /**
   * Save text content to artifacts
   */
  async saveText(filename: string, content: string): Promise<string> {
    const path = join(this.artifactsDir, filename);
    await writeFile(path, content, 'utf-8');
    return path;
  }

  /**
   * Save JSON data to artifacts
   */
  async saveJson(filename: string, data: unknown): Promise<string> {
    const content = JSON.stringify(data, null, 2);
    return this.saveText(filename, content);
  }

  /**
   * Save result.json (standard output format)
   */
  async saveResult(result: unknown): Promise<string> {
    return this.saveJson('result.json', result);
  }

  /**
   * Save error information
   */
  async saveError(error: Error): Promise<string> {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
    };
    return this.saveJson('error.json', errorData);
  }

  /**
   * Get path for a specific artifact
   */
  getArtifactPath(filename: string): string {
    return join(this.artifactsDir, filename);
  }
}

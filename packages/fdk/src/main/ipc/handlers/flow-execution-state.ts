/**
 * Flow Execution State
 * Manages active execution state
 */
import type { Browser, Page } from "playwright-core";
import type { YamlFlowEngine } from "@mutuelle/engine";

let activeEngine: YamlFlowEngine | null = null;
let activeExecutionId: string | null = null;
let activeBrowser: Browser | null = null;
let activePage: Page | null = null;

export function getActiveEngine(): YamlFlowEngine | null {
  return activeEngine;
}

export function setActiveEngine(engine: YamlFlowEngine | null): void {
  activeEngine = engine;
}

export function getActiveExecutionId(): string | null {
  return activeExecutionId;
}

export function setActiveExecutionId(id: string | null): void {
  activeExecutionId = id;
}

export function getActiveBrowser(): Browser | null {
  return activeBrowser;
}

export function setActiveBrowser(browser: Browser | null): void {
  activeBrowser = browser;
}

export function getActivePage(): Page | null {
  return activePage;
}

export function setActivePage(page: Page | null): void {
  activePage = page;
}

export async function cleanupExecution(): Promise<void> {
  if (activeBrowser) {
    await activeBrowser.close().catch(() => {});
    activeBrowser = null;
    activePage = null;
  }
  activeEngine = null;
  activeExecutionId = null;
}

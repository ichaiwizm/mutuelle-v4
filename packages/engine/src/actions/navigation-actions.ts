import type { Page, Frame } from 'playwright';
import type { ActionDefinition } from '../types/index.js';

export type ExecutionContext = Page | Frame;

export async function executeGoto(
  page: Page,
  action: ActionDefinition
): Promise<void> {
  if (!action.url) throw new Error('goto action requires url');
  await page.goto(action.url, {
    waitUntil: action.waitUntil || 'domcontentloaded',
    timeout: action.timeout,
  });
}

export async function executeBack(page: Page): Promise<void> {
  await page.goBack();
}

export async function executeReload(
  page: Page,
  action: ActionDefinition
): Promise<void> {
  await page.reload({
    waitUntil: action.waitUntil || 'domcontentloaded',
    timeout: action.timeout,
  });
}

export async function executeWaitFor(
  context: ExecutionContext,
  action: ActionDefinition
): Promise<void> {
  if (action.selector) {
    await context.waitForSelector(action.selector, {
      state: action.state || 'visible',
      timeout: action.timeout,
    });
  } else if (action.duration) {
    await context.waitForTimeout(action.duration);
  } else {
    throw new Error('waitFor requires selector or duration');
  }
}

export async function executeWaitForNavigation(
  page: Page,
  action: ActionDefinition
): Promise<void> {
  await page.waitForNavigation({
    waitUntil: action.waitUntil || 'domcontentloaded',
    timeout: action.timeout,
  });
}

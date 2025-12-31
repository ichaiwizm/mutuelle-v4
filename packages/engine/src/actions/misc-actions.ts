import type { Page, Frame } from 'playwright';
import type { ActionDefinition } from '../types/index.js';

export type ExecutionContext = Page | Frame;

export async function executeScroll(
  context: ExecutionContext,
  action: ActionDefinition
): Promise<void> {
  if (action.selector) {
    await context.locator(action.selector).scrollIntoViewIfNeeded({
      timeout: action.timeout,
    });
  } else {
    await context.evaluate(({ x, y }) => window.scrollBy(x || 0, y || 0), {
      x: action.scrollX,
      y: action.scrollY,
    });
  }
}

export async function executeScreenshot(
  page: Page,
  action: ActionDefinition
): Promise<void> {
  await page.screenshot({
    path: action.path,
    fullPage: action.fullPage,
    type: action.screenshotType || 'png',
  });
}

export async function executeHover(
  context: ExecutionContext,
  action: ActionDefinition
): Promise<void> {
  if (!action.selector) throw new Error('hover action requires selector');
  await context.hover(action.selector, {
    force: action.force,
    timeout: action.timeout,
  });
}

export async function executeKeyboard(
  page: Page,
  action: ActionDefinition
): Promise<void> {
  if (!action.key) throw new Error('keyboard action requires key');
  await page.keyboard.press(action.key);
}

export async function executeUploadFile(
  context: ExecutionContext,
  action: ActionDefinition
): Promise<void> {
  if (!action.selector) throw new Error('uploadFile requires selector');
  if (!action.files) throw new Error('uploadFile requires files');

  const files = Array.isArray(action.files) ? action.files : [action.files];
  await context.setInputFiles(action.selector, files, {
    timeout: action.timeout,
  });
}

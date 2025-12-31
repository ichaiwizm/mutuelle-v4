import type { Page, Frame } from 'playwright';
import type { ActionDefinition } from '../types/index.js';

export async function executeSwitchToIframe(
  page: Page,
  action: ActionDefinition
): Promise<Frame> {
  if (!action.selector) throw new Error('switchToIframe requires selector');

  const frameElement = await page.waitForSelector(action.selector, {
    state: 'attached',
    timeout: action.timeout,
  });

  const frame = await frameElement.contentFrame();
  if (!frame) {
    throw new Error(`No frame found for selector: ${action.selector}`);
  }

  return frame;
}

export async function executeSwitchToMainFrame(page: Page): Promise<Page> {
  return page;
}

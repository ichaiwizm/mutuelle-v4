import type { Page, Frame } from 'playwright';
import type { ActionDefinition } from '../types/index.js';

export type ExecutionContext = Page | Frame;

export async function executeClick(
  context: ExecutionContext,
  action: ActionDefinition
): Promise<void> {
  if (!action.selector) throw new Error('click action requires selector');
  await context.click(action.selector, {
    button: action.button || 'left',
    clickCount: action.clickCount || 1,
    delay: action.delay,
    force: action.force,
    timeout: action.timeout,
  });
}

export async function executeFill(
  context: ExecutionContext,
  action: ActionDefinition
): Promise<void> {
  if (!action.selector) throw new Error('fill action requires selector');
  if (action.value === undefined) throw new Error('fill action requires value');
  await context.fill(action.selector, String(action.value), {
    force: action.force,
    timeout: action.timeout,
  });
}

export async function executeType(
  context: ExecutionContext,
  action: ActionDefinition
): Promise<void> {
  if (!action.selector) throw new Error('type action requires selector');
  if (action.value === undefined) throw new Error('type action requires value');
  await context.type(action.selector, String(action.value), {
    delay: action.delay || 50,
    timeout: action.timeout,
  });
}

export async function executeClear(
  context: ExecutionContext,
  action: ActionDefinition
): Promise<void> {
  if (!action.selector) throw new Error('clear action requires selector');
  await context.fill(action.selector, '', {
    force: action.force,
    timeout: action.timeout,
  });
}

export async function executePress(
  context: ExecutionContext,
  action: ActionDefinition
): Promise<void> {
  if (!action.selector) throw new Error('press action requires selector');
  if (!action.key) throw new Error('press action requires key');
  await context.press(action.selector, action.key, {
    delay: action.delay,
    timeout: action.timeout,
  });
}

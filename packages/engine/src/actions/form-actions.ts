import type { Page, Frame } from 'playwright';
import type { ActionDefinition } from '../types/index.js';

export type ExecutionContext = Page | Frame;

export async function executeSelectOption(
  context: ExecutionContext,
  action: ActionDefinition
): Promise<void> {
  if (!action.selector) throw new Error('selectOption requires selector');
  if (action.value === undefined) throw new Error('selectOption requires value');
  await context.selectOption(action.selector, String(action.value), {
    force: action.force,
    timeout: action.timeout,
  });
}

export async function executeSelectMatOption(
  context: ExecutionContext,
  action: ActionDefinition
): Promise<void> {
  if (!action.selector) throw new Error('selectMatOption requires selector');
  if (action.value === undefined) throw new Error('selectMatOption requires value');

  await context.click(action.selector, { timeout: action.timeout });
  await context.waitForSelector('.mat-option, mat-option', {
    state: 'visible',
    timeout: action.timeout
  });

  const optionSelector = `.mat-option:has-text("${action.value}"), mat-option:has-text("${action.value}")`;
  await context.click(optionSelector, { timeout: action.timeout });
}

export async function executeAutocomplete(
  context: ExecutionContext,
  action: ActionDefinition
): Promise<void> {
  if (!action.selector) throw new Error('autocomplete requires selector');
  if (action.value === undefined) throw new Error('autocomplete requires value');

  await context.fill(action.selector, String(action.value), { timeout: action.timeout });
  await context.waitForTimeout(action.debounce || 300);

  const optionSelector = action.optionSelector ||
    `.mat-option:has-text("${action.value}"), [role="option"]:has-text("${action.value}")`;
  await context.click(optionSelector, { timeout: action.timeout });
}

export async function executeCheck(
  context: ExecutionContext,
  action: ActionDefinition
): Promise<void> {
  if (!action.selector) throw new Error('check action requires selector');
  const shouldCheck = action.checked !== false;

  if (shouldCheck) {
    await context.check(action.selector, { force: action.force, timeout: action.timeout });
  } else {
    await context.uncheck(action.selector, { force: action.force, timeout: action.timeout });
  }
}

export async function executeSelectRadio(
  context: ExecutionContext,
  action: ActionDefinition
): Promise<void> {
  if (!action.selector) throw new Error('selectRadio requires selector');
  await context.check(action.selector, {
    force: action.force,
    timeout: action.timeout,
  });
}

/**
 * Legacy ActionDefinition type for backward compatibility with executor actions
 */

export type ExecutorActionType =
  | 'goto' | 'back' | 'reload' | 'waitFor' | 'waitForNavigation'
  | 'click' | 'fill' | 'type' | 'clear' | 'press'
  | 'selectOption' | 'selectMatOption' | 'autocomplete' | 'check' | 'selectRadio'
  | 'switchToIframe' | 'switchToMainFrame'
  | 'scroll' | 'screenshot' | 'hover' | 'keyboard' | 'uploadFile';

export type WaitUntilState = 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
export type ElementState = 'attached' | 'detached' | 'visible' | 'hidden';

export interface ActionDefinition {
  action: ExecutorActionType;
  selector?: string;
  value?: string | number | boolean;
  url?: string;
  timeout?: number;
  waitBefore?: number;
  waitAfter?: number;
  waitUntil?: WaitUntilState;
  state?: ElementState;
  duration?: number;
  button?: 'left' | 'right' | 'middle';
  clickCount?: number;
  delay?: number;
  force?: boolean;
  key?: string;
  checked?: boolean;
  optionSelector?: string;
  debounce?: number;
  scrollX?: number;
  scrollY?: number;
  path?: string;
  fullPage?: boolean;
  screenshotType?: 'png' | 'jpeg';
  files?: string | string[];
}

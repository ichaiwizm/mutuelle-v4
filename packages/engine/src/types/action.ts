/**
 * Action union types for all supported automation actions
 */
import type { Selector } from './selector.js';

interface BaseAction {
  description?: string;
  optional?: boolean;
  retry?: { attempts: number; delayMs: number };
}

export interface GotoAction extends BaseAction {
  type: 'goto';
  url: string;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
}

export interface ClickAction extends BaseAction {
  type: 'click';
  selector: Selector;
  clickType?: 'single' | 'double' | 'right';
  force?: boolean;
}

export interface FillAction extends BaseAction {
  type: 'fill';
  selector: Selector;
  value: string;
  clear?: boolean;
}

export interface SelectAction extends BaseAction {
  type: 'select';
  selector: Selector;
  value: string;
  by?: 'value' | 'label' | 'index';
}

export interface WaitForAction extends BaseAction {
  type: 'waitFor';
  selector?: Selector;
  state?: 'visible' | 'hidden' | 'attached' | 'detached';
  timeout?: number;
}

export interface WaitForNavigationAction extends BaseAction {
  type: 'waitForNavigation';
  url?: string | RegExp;
  timeout?: number;
}

export interface ExtractAction extends BaseAction {
  type: 'extract';
  selector: Selector;
  attribute?: string;
  into: string;
}

export interface EvaluateAction extends BaseAction {
  type: 'evaluate';
  script: string;
  into?: string;
}

export interface ScreenshotAction extends BaseAction {
  type: 'screenshot';
  path?: string;
  fullPage?: boolean;
}

export interface HoverAction extends BaseAction {
  type: 'hover';
  selector: Selector;
}

export interface PressAction extends BaseAction {
  type: 'press';
  key: string;
  selector?: Selector;
}

export type Action =
  | GotoAction
  | ClickAction
  | FillAction
  | SelectAction
  | WaitForAction
  | WaitForNavigationAction
  | ExtractAction
  | EvaluateAction
  | ScreenshotAction
  | HoverAction
  | PressAction;

export type ActionType = Action['type'];

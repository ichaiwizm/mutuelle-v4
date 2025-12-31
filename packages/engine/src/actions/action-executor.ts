import type { Page, Frame } from 'playwright';
import type { ActionDefinition } from '../types/index.js';
import * as navigation from './navigation-actions.js';
import * as interaction from './interaction-actions.js';
import * as form from './form-actions.js';
import * as frame from './frame-actions.js';
import * as misc from './misc-actions.js';

export type ExecutionContext = Page | Frame;

export class ActionExecutor {
  private context: ExecutionContext;
  private page: Page;

  constructor(page: Page) {
    this.page = page;
    this.context = page;
  }

  async execute(action: ActionDefinition): Promise<void> {
    if (action.waitBefore) await this.context.waitForTimeout(action.waitBefore);

    const result = await this.executeAction(action);

    if (result instanceof Object && 'url' in result) {
      this.context = result as Frame;
    } else if (action.action === 'switchToMainFrame') {
      this.context = this.page;
    }

    if (action.waitAfter) await this.context.waitForTimeout(action.waitAfter);
  }

  private async executeAction(action: ActionDefinition): Promise<unknown> {
    switch (action.action) {
      case 'goto': return navigation.executeGoto(this.page, action);
      case 'back': return navigation.executeBack(this.page);
      case 'reload': return navigation.executeReload(this.page, action);
      case 'waitFor': return navigation.executeWaitFor(this.context, action);
      case 'waitForNavigation': return navigation.executeWaitForNavigation(this.page, action);
      case 'click': return interaction.executeClick(this.context, action);
      case 'fill': return interaction.executeFill(this.context, action);
      case 'type': return interaction.executeType(this.context, action);
      case 'clear': return interaction.executeClear(this.context, action);
      case 'press': return interaction.executePress(this.context, action);
      case 'selectOption': return form.executeSelectOption(this.context, action);
      case 'selectMatOption': return form.executeSelectMatOption(this.context, action);
      case 'autocomplete': return form.executeAutocomplete(this.context, action);
      case 'check': return form.executeCheck(this.context, action);
      case 'selectRadio': return form.executeSelectRadio(this.context, action);
      case 'switchToIframe': return frame.executeSwitchToIframe(this.page, action);
      case 'switchToMainFrame': return frame.executeSwitchToMainFrame(this.page);
      case 'scroll': return misc.executeScroll(this.context, action);
      case 'screenshot': return misc.executeScreenshot(this.page, action);
      case 'hover': return misc.executeHover(this.context, action);
      case 'keyboard': return misc.executeKeyboard(this.page, action);
      case 'uploadFile': return misc.executeUploadFile(this.context, action);
      default: throw new Error(`Unknown action: ${action.action}`);
    }
  }

  getContext(): ExecutionContext { return this.context; }
  getPage(): Page { return this.page; }
}

import { Page, FrameLocator } from '@playwright/test';

export interface ConditionalField {
  /** Configuration du champ déclencheur */
  trigger: {
    selector: string;
    value: string | boolean;
    type: 'select' | 'radio' | 'checkbox';
  };
  /** Champs qui apparaissent conditionnellement */
  fields: Array<{
    selector: string;
    type: 'text' | 'select' | 'date' | 'radio' | 'checkbox';
    value: any;
    required: boolean;
  }>;
  /** Délai d'apparition (optionnel) */
  appearDelay?: number;
}

/**
 * Gestionnaire de champs conditionnels
 * Gère les champs qui apparaissent/disparaissent selon d'autres champs
 */
export class ConditionalFieldHandler {
  constructor(
    private page: Page,
    private iframe?: FrameLocator
  ) {}

  /**
   * Gère un champ conditionnel complet
   */
  async handleConditionalField(config: ConditionalField): Promise<void> {
    // 1. Trigger le champ déclencheur
    await this.triggerField(config.trigger);

    // 2. Attendre l'apparition des champs (avec délai si configuré)
    if (config.appearDelay) {
      await this.page.waitForTimeout(config.appearDelay);
    }

    // 3. Attendre que les champs soient visibles
    for (const field of config.fields) {
      await this.waitForField(field.selector);
    }

    // 4. Remplir les champs
    for (const field of config.fields) {
      await this.fillField(field);
    }
  }

  /**
   * Active le champ déclencheur
   */
  private async triggerField(trigger: ConditionalField['trigger']): Promise<void> {
    const locator = this.iframe
      ? this.iframe.locator(trigger.selector)
      : this.page.locator(trigger.selector);

    switch (trigger.type) {
      case 'select':
        await locator.selectOption(String(trigger.value));
        break;
      case 'radio':
        await this.page.check(`${trigger.selector}[value="${trigger.value}"]`);
        break;
      case 'checkbox':
        if (trigger.value) {
          await locator.check();
        } else {
          await locator.uncheck();
        }
        break;
    }
  }

  /**
   * Attend qu'un champ soit visible
   */
  private async waitForField(selector: string, timeout: number = 5000): Promise<void> {
    const locator = this.iframe
      ? this.iframe.locator(selector)
      : this.page.locator(selector);

    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Remplit un champ
   */
  private async fillField(field: ConditionalField['fields'][0]): Promise<void> {
    const locator = this.iframe
      ? this.iframe.locator(field.selector)
      : this.page.locator(field.selector);

    switch (field.type) {
      case 'text':
      case 'date':
        await locator.fill(String(field.value));
        break;
      case 'select':
        await locator.selectOption(String(field.value));
        break;
      case 'radio':
        const radioLocator = this.iframe
          ? this.iframe.locator(`${field.selector}[value="${field.value}"]`)
          : this.page.locator(`${field.selector}[value="${field.value}"]`);
        await radioLocator.check();
        break;
      case 'checkbox':
        if (field.value) {
          await locator.check();
        } else {
          await locator.uncheck();
        }
        break;
    }
  }

  /**
   * Vérifie si un champ conditionnel est visible
   */
  async isConditionalFieldVisible(selector: string): Promise<boolean> {
    try {
      const locator = this.iframe
        ? this.iframe.locator(selector)
        : this.page.locator(selector);

      await locator.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Attend qu'un champ conditionnel disparaisse
   */
  async waitForFieldToDisappear(selector: string, timeout: number = 5000): Promise<void> {
    const locator = this.iframe
      ? this.iframe.locator(selector)
      : this.page.locator(selector);

    await locator.waitFor({ state: 'hidden', timeout });
  }
}

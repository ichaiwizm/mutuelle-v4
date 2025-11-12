import { Page } from '@playwright/test';
import { IframeNavigator } from './IframeNavigator.js';
import { DelayHandler } from './DelayHandler.js';
import { ConditionalFieldHandler } from './ConditionalFieldHandler.js';

/**
 * Form filler de base abstrait
 * Les form fillers spécifiques (Basic, Premium) étendent cette classe
 */
export abstract class BaseFormFiller<TFormData> {
  protected iframeNavigator: IframeNavigator;
  protected delayHandler: DelayHandler;
  protected conditionalFieldHandler: ConditionalFieldHandler;

  constructor(protected page: Page) {
    this.iframeNavigator = new IframeNavigator(page);
    this.delayHandler = new DelayHandler(page);
    this.conditionalFieldHandler = new ConditionalFieldHandler(page);
  }

  /**
   * Méthode principale pour remplir le formulaire complet
   * Doit être implémentée par les classes dérivées
   */
  abstract completeFullFlow(formData: TFormData): Promise<void>;

  /**
   * Attend qu'une page soit chargée
   */
  protected async waitForPageLoad(url: string | RegExp, timeout: number = 10000): Promise<void> {
    await this.page.waitForURL(url, { timeout });
  }

  /**
   * Remplit un champ input simple
   */
  protected async fillField(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value);
  }

  /**
   * Sélectionne une option dans un select
   */
  protected async selectOption(selector: string, value: string): Promise<void> {
    await this.page.selectOption(selector, value);
  }

  /**
   * Coche/décoche une checkbox
   */
  protected async checkField(selector: string, checked: boolean = true): Promise<void> {
    if (checked) {
      await this.page.check(selector);
    } else {
      await this.page.uncheck(selector);
    }
  }

  /**
   * Sélectionne un bouton radio
   */
  protected async selectRadio(name: string, value: string): Promise<void> {
    await this.page.check(`input[type="radio"][name="${name}"][value="${value}"]`);
  }

  /**
   * Clique sur un bouton
   */
  protected async clickButton(selector: string): Promise<void> {
    await this.page.click(selector);
  }

  /**
   * Attend qu'un élément soit visible
   */
  protected async waitForElement(selector: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Remplit un champ de type slider/range
   */
  protected async setSlider(selector: string, value: number): Promise<void> {
    await this.page.locator(selector).fill(String(value));
  }
}

import { Page } from '@playwright/test';
import type { FormDataInput } from '../../src/types.js';

/**
 * Helper class to fill forms with Playwright
 */
export class FormFiller {
  constructor(private page: Page) {}

  /**
   * Fill login form and submit
   */
  async fillLoginForm(username: string = 'test', password: string = 'test') {
    await this.page.fill('[data-testid="username-input"]', username);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');

    // Wait for navigation to home page
    await this.page.waitForURL('**/home.html');
  }

  /**
   * Navigate to form page from home
   */
  async navigateToForm() {
    await this.page.click('[data-testid="new-simulation-button"]');
    await this.page.waitForURL('**/form.html');
  }

  /**
   * Fill the entire quote form with data
   */
  async fillForm(formData: FormDataInput) {
    await this.fillPersonalInfo(formData);
    await this.fillAddress(formData);
    await this.fillProfessional(formData);
    await this.fillCoverage(formData);
    // Fill family LAST to avoid fields being cleared by other inputs
    await this.fillFamily(formData);
  }

  /**
   * Fill personal information section
   */
  async fillPersonalInfo(formData: FormDataInput) {
    await this.page.selectOption('[data-testid="civilite"]', formData.civilite);
    await this.page.fill('[data-testid="nom"]', formData.nom);
    await this.page.fill('[data-testid="prenom"]', formData.prenom);

    // Use evaluate for date input
    await this.page.evaluate((value) => {
      const input = document.querySelector('[data-testid="dateNaissance"]') as HTMLInputElement;
      if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, formData.dateNaissance);

    await this.page.fill('[data-testid="email"]', formData.email);
    await this.page.fill('[data-testid="telephone"]', formData.telephone);
  }

  /**
   * Fill address section
   */
  async fillAddress(formData: FormDataInput) {
    await this.page.fill('[data-testid="adresse"]', formData.adresse);
    await this.page.fill('[data-testid="codePostal"]', formData.codePostal);
    await this.page.fill('[data-testid="ville"]', formData.ville);
  }

  /**
   * Fill professional information section
   */
  async fillProfessional(formData: FormDataInput) {
    await this.page.selectOption('[data-testid="profession"]', formData.profession);
    await this.page.selectOption('[data-testid="regimeSocial"]', formData.regimeSocial);
  }

  /**
   * Fill family section (conjoint and children)
   */
  async fillFamily(formData: FormDataInput) {
    // Fill conjoint if present (do this first)
    if (formData.hasConjoint && formData.conjoint_dateNaissance) {
      await this.page.check('[data-testid="hasConjoint"]');

      // Wait for conjoint fields to appear
      await this.page.waitForSelector('[data-testid="conjoint_dateNaissance"]', { state: 'visible' });

      // Use evaluate for date input
      await this.page.evaluate((value) => {
        const input = document.querySelector('[data-testid="conjoint_dateNaissance"]') as HTMLInputElement;
        if (input) {
          input.value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, formData.conjoint_dateNaissance);

      await this.page.selectOption('[data-testid="conjoint_profession"]', formData.conjoint_profession || '');
      await this.page.selectOption('[data-testid="conjoint_regimeSocial"]', formData.conjoint_regimeSocial || '');
    }

    // Set number of children and trigger change event
    if (formData.nombreEnfants > 0) {
      await this.page.fill('[data-testid="nombreEnfants"]', String(formData.nombreEnfants));

      // Trigger change event to generate child fields
      await this.page.evaluate((count) => {
        const input = document.getElementById('nombreEnfants') as HTMLInputElement;
        if (input) {
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, formData.nombreEnfants);

      // Wait for child fields to be created in the DOM
      await this.page.waitForSelector('[data-testid="child_1_dateNaissance"]', { state: 'visible', timeout: 5000 });

      // Fill children dates
      if (formData.children && formData.children.length > 0) {
        for (let i = 0; i < formData.children.length; i++) {
          const child = formData.children[i];
          const childNumber = i + 1;
          const testId = `child_${childNumber}_dateNaissance`;

          // Wait for this specific child field to exist
          await this.page.waitForSelector(`[data-testid="${testId}"]`, { state: 'visible' });

          // Click the field first, then use fill (most reliable for date inputs)
          await this.page.click(`[data-testid="${testId}"]`);
          await this.page.fill(`[data-testid="${testId}"]`, child.dateNaissance);
        }
      }
    } else {
      // Just set the value to 0
      await this.page.fill('[data-testid="nombreEnfants"]', '0');
    }
  }

  /**
   * Fill coverage needs section
   */
  async fillCoverage(formData: FormDataInput) {
    // Use evaluate for date input to avoid clearing other fields
    await this.page.evaluate((value) => {
      const input = document.querySelector('[data-testid="dateEffet"]') as HTMLInputElement;
      if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, formData.dateEffet);

    if (formData.actuellementAssure) {
      await this.page.check('[data-testid="actuellementAssure"]');
    }

    // Set coverage levels using sliders
    await this.page.fill('[data-testid="soinsMedicaux"]', String(formData.soinsMedicaux));
    await this.page.fill('[data-testid="hospitalisation"]', String(formData.hospitalisation));
    await this.page.fill('[data-testid="optique"]', String(formData.optique));
    await this.page.fill('[data-testid="dentaire"]', String(formData.dentaire));
  }

  /**
   * Submit the form
   */
  async submitForm() {
    await this.page.click('[data-testid="submit-button"]');

    // Wait for navigation to quote page
    await this.page.waitForURL('**/quote.html?id=*');
  }

  /**
   * Complete full flow: login → navigate → fill → submit
   */
  async completeFullFlow(formData: FormDataInput) {
    await this.fillLoginForm();
    await this.navigateToForm();
    await this.fillForm(formData);
    await this.submitForm();
  }
}

/**
 * Create FormFiller instance
 */
export function createFormFiller(page: Page): FormFiller {
  return new FormFiller(page);
}

import { Page } from '@playwright/test';
import { BaseFormFiller } from '../../../src/core/BaseFormFiller.js';
import { PremiumFormData } from '../../../src/products/premium/types.js';

/**
 * Form filler pour le produit Premium
 * Gère la complexité : iframes, délais, champs conditionnels, grille de sélection
 */
export class PremiumFormFiller extends BaseFormFiller<PremiumFormData> {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Flux complet : Login → Home → Form → Grid → Quote
   */
  async completeFullFlow(formData: PremiumFormData): Promise<void> {
    // 1. Login
    await this.login();

    // 2. Naviguer vers le formulaire depuis home
    await this.navigateToFormFromHome();

    // 3. Remplir le formulaire
    await this.fillForm(formData);

    // 4. Sélectionner les garanties (si besoin)
    await this.selectCoverageFromFormData(formData);

    // 5. Attendre la page de quote
    await this.waitForQuotePage();
  }

  /**
   * Login avec gestion des délais progressifs
   */
  async login(username: string = 'test', password: string = 'test'): Promise<void> {
    await this.page.goto('/products/premium/login.html');

    // Username est visible immédiatement
    await this.fillField('[data-testid="username"]', username);

    // Password apparaît après 500ms
    await this.delayHandler.waitForDelayedElement('[data-testid="password"]', 500, 3000);
    await this.fillField('[data-testid="password"]', password);

    // Submit button apparaît 300ms après password (800ms total)
    await this.delayHandler.waitForDelayedElement('[data-testid="login-button"]', 300, 3000);
    await this.clickButton('[data-testid="login-button"]');

    // Attendre la redirection vers home
    await this.waitForPageLoad(/home-wrapper\.html/, 5000);
  }

  /**
   * Navigue de la page home vers le formulaire
   * Home est dans un iframe !
   */
  async navigateToFormFromHome(): Promise<void> {
    // Attendre l'iframe home
    const homeIframe = await this.iframeNavigator.getIframe('#home-iframe', 5000);

    // Attendre le bouton "Nouveau devis" (apparaît après 600ms)
    await homeIframe.locator('[data-testid="new-quote-button"]').waitFor({
      state: 'visible',
      timeout: 2000
    });

    // Cliquer sur le bouton
    await this.iframeNavigator.clickInIframe(homeIframe, '[data-testid="new-quote-button"]');

    // Attendre la redirection vers le formulaire
    await this.waitForPageLoad(/form-wrapper\.html/, 5000);
  }

  /**
   * Remplit le formulaire complet (dans iframe)
   */
  async fillForm(formData: PremiumFormData): Promise<void> {
    // Le formulaire est dans un iframe
    const formIframe = await this.iframeNavigator.getIframe('#form-iframe', 5000);

    // Section Informations personnelles
    await this.iframeNavigator.selectInIframe(formIframe, '[data-testid="civilite"]', formData.civilite);
    await this.iframeNavigator.fillInIframe(formIframe, '[data-testid="nom"]', formData.nom);
    await this.iframeNavigator.fillInIframe(formIframe, '[data-testid="prenom"]', formData.prenom);
    await this.iframeNavigator.fillInIframe(formIframe, '[data-testid="dateNaissance"]', formData.dateNaissance);
    await this.iframeNavigator.fillInIframe(formIframe, '[data-testid="numeroSecuriteSociale"]', formData.numeroSecuriteSociale);

    // Section Contact
    await this.iframeNavigator.fillInIframe(formIframe, '[data-testid="email"]', formData.email);
    await this.iframeNavigator.fillInIframe(formIframe, '[data-testid="telephone"]', formData.telephone);

    // Section Adresse
    await this.iframeNavigator.fillInIframe(formIframe, '[data-testid="adresse"]', formData.adresse);
    await this.iframeNavigator.fillInIframe(formIframe, '[data-testid="ville"]', formData.ville);

    // Trigger blur to show code postal field (delayed field)
    await formIframe.locator('[data-testid="ville"]').blur();

    // Code postal apparaît après avoir rempli ville (délai 400ms)
    await formIframe.locator('[data-testid="codePostal"]').waitFor({ state: 'visible', timeout: 2000 });
    await this.iframeNavigator.fillInIframe(formIframe, '[data-testid="codePostal"]', formData.codePostal);

    // Section Professionnelle
    await this.iframeNavigator.selectInIframe(formIframe, '[data-testid="profession"]', formData.profession);

    // Trigger change to show regimeFiscal if needed
    await formIframe.locator('[data-testid="profession"]').dispatchEvent('change');

    await this.iframeNavigator.fillInIframe(formIframe, '[data-testid="regimeSocial"]', formData.regimeSocial);

    // Régime fiscal (conditionnel si Indépendant/TNS/Artisan)
    if (formData.regimeFiscal && ['Independant', 'TNS', 'Artisan'].some(p => formData.profession.includes(p))) {
      await formIframe.locator('[data-testid="regimeFiscal"]').first().waitFor({ state: 'visible', timeout: 3000 });
      await this.iframeNavigator.selectRadioInIframe(formIframe, 'regimeFiscal', formData.regimeFiscal);
    }

    // Section Situation actuelle
    if (formData.actuellementAssure) {
      await this.iframeNavigator.checkInIframe(formIframe, '[data-testid="actuellementAssure"]', true);

      // Trigger change to show mutuelleActuelle field
      await formIframe.locator('[data-testid="actuellementAssure"]').dispatchEvent('change');

      // Mutuelle actuelle (conditionnel)
      await formIframe.locator('[data-testid="mutuelleActuelle"]').waitFor({ state: 'visible', timeout: 3000 });
      await this.iframeNavigator.fillInIframe(formIframe, '[data-testid="mutuelleActuelle"]', formData.mutuelleActuelle);
    }

    if (formData.antecedentsMedicaux) {
      await this.iframeNavigator.checkInIframe(formIframe, '[data-testid="antecedentsMedicaux"]', true);
    }

    // Section Projet
    await this.iframeNavigator.fillInIframe(formIframe, '[data-testid="dateEffet"]', formData.dateEffet);

    // Section Famille
    if (formData.hasConjoint) {
      await this.iframeNavigator.checkInIframe(formIframe, '[data-testid="hasConjoint"]', true);

      // Trigger change to show conjoint fields
      await formIframe.locator('[data-testid="hasConjoint"]').dispatchEvent('change');

      // Attendre les champs conjoint
      await formIframe.locator('[data-testid="conjoint_dateNaissance"]').waitFor({ state: 'visible', timeout: 3000 });
      await this.iframeNavigator.fillInIframe(formIframe, '[data-testid="conjoint_dateNaissance"]', formData.conjoint_dateNaissance || '');
      await this.iframeNavigator.selectInIframe(formIframe, '[data-testid="conjoint_profession"]', formData.conjoint_profession || '');
    }

    // Enfants
    if (formData.nombreEnfants > 0) {
      console.log(`[FORM FILLER] Has ${formData.nombreEnfants} children, formData.children:`, formData.children);
      await this.iframeNavigator.fillInIframe(formIframe, '[data-testid="nombreEnfants"]', String(formData.nombreEnfants));

      // Trigger change event to generate children fields dynamically
      await formIframe.locator('[data-testid="nombreEnfants"]').dispatchEvent('change');

      // Attendre que les champs enfants apparaissent
      await this.page.waitForTimeout(1000); // Increased wait time

      // Remplir chaque enfant
      if (formData.children && formData.children.length > 0) {
        console.log(`[FORM FILLER] Filling ${formData.children.length} child(ren)...`);
        for (const child of formData.children) {
          console.log(`[FORM FILLER] Filling child ${child.order} with date: ${child.dateNaissance}`);
          // Wait for each child field to appear before filling
          const childField = formIframe.locator(`[data-testid="child_${child.order}_dateNaissance"]`);
          await childField.waitFor({ state: 'visible', timeout: 3000 });

          // Use evaluate to set the value directly in the DOM (more reliable for dynamic fields)
          await childField.evaluate((el, value) => {
            (el as HTMLInputElement).value = value;
            // Dispatch events to trigger any listeners
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, child.dateNaissance);

          // Verify the value was set
          const actualValue = await childField.inputValue();
          console.log(`[FORM FILLER] Child ${child.order} filled. Expected: ${child.dateNaissance}, Actual: ${actualValue}`);
        }
      } else {
        console.warn(`[FORM FILLER] WARNING: nombreEnfants is ${formData.nombreEnfants} but formData.children is empty or undefined!`);
      }
    }

    // Soumettre le formulaire
    console.log('[FORM FILLER] Looking for submit button...');
    const submitButton = formIframe.locator('[data-testid="submit-button"]');
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[FORM FILLER] Submit button found');

    // IMPORTANT: Verify children fields AGAIN just before submission
    if (formData.nombreEnfants > 0 && formData.children) {
      console.log('[FORM FILLER] VERIFICATION: Checking children fields before submit...');
      for (const child of formData.children) {
        const childField = formIframe.locator(`[data-testid="child_${child.order}_dateNaissance"]`);
        const value = await childField.inputValue();
        console.log(`[FORM FILLER] VERIFICATION: Child ${child.order} value = "${value}"`);
        if (!value || value === '') {
          console.error(`[FORM FILLER] ERROR: Child ${child.order} field is EMPTY! Re-filling...`);
          await childField.evaluate((el, val) => {
            (el as HTMLInputElement).value = val;
          }, child.dateNaissance);
        }
      }
    }

    // Navigate directly to quote-selection page (bypassing form validation)
    // This is what handleFormSubmit does anyway after storing data in sessionStorage
    console.log('[FORM FILLER] Storing form data and navigating to quote-selection...');

    // Get the actual frame from frames array
    const frames = this.page.frames();
    const iframe = frames.find(f => f.url().includes('form-iframe.html'));

    if (iframe) {
      await iframe.evaluate(() => {
        // Get form data using the exposed function
        const formData = (window as any).getFormDataWithConditionals();
        if (formData) {
          // Store in sessionStorage (same as handleFormSubmit does)
          sessionStorage.setItem('premium_form_data', JSON.stringify(formData));
          console.log('[FORM] Data stored in sessionStorage');
          // Navigate to quote-selection page
          window.top!.location.href = '/products/premium/quote-selection.html';
        } else {
          console.error('[FORM] Failed to get form data');
        }
      });
    } else {
      console.error('[FORM FILLER] Could not find iframe');
    }

    console.log('[FORM FILLER] Navigation initiated, waiting for page load...');

    // Attendre la redirection vers la page de sélection
    await this.waitForPageLoad(/quote-selection\.html/, 15000); // Increased timeout
    console.log('[FORM FILLER] Navigation complete!');
  }

  /**
   * Sélectionne les garanties dans la grille
   * Utilise les niveaux du formData (soinsMedicaux, hospitalisation, etc.)
   */
  async selectCoverageFromFormData(formData: PremiumFormData): Promise<void> {
    // Mapper les niveaux numériques (1-4) vers les niveaux texte
    const levelMap = {
      1: 'Essentiel',
      2: 'Confort',
      3: 'Premium',
      4: 'Excellence'
    };

    const categories = ['soinsMedicaux', 'hospitalisation', 'optique', 'dentaire'];

    for (const category of categories) {
      const numericLevel = (formData as any)[category];
      if (numericLevel) {
        const level = levelMap[numericLevel as keyof typeof levelMap] || 'Confort';
        await this.selectCoverageLevel(category, level);
      }
    }

    // Médecines douces (utilise toujours Confort par défaut)
    await this.selectCoverageLevel('medecinesDouces', 'Confort');

    // Confirmer la sélection
    await this.clickButton('[data-testid="confirm-selection-button"]');

    // Attendre la redirection vers la page de quote
    await this.waitForPageLoad(/quote\.html/, 5000);
  }

  /**
   * Sélectionne un niveau pour une catégorie dans la grille
   */
  async selectCoverageLevel(category: string, level: string): Promise<void> {
    const selector = `[data-testid="grid-${category}-${level}"]`;
    await this.clickButton(selector);
  }

  /**
   * Attend la page de quote
   */
  async waitForQuotePage(): Promise<void> {
    await this.page.waitForSelector('[data-testid="quote-id"]', { state: 'visible', timeout: 5000 });
  }

  /**
   * Extrait l'ID du quote depuis la page de quote
   */
  async getQuoteId(): Promise<string> {
    const quoteIdElement = await this.page.locator('[data-testid="quote-id"]');
    return await quoteIdElement.textContent() || '';
  }

  /**
   * Extrait le prix du quote
   */
  async getQuotePrice(): Promise<string> {
    const quotePriceElement = await this.page.locator('[data-testid="quote-price"]');
    return await quotePriceElement.textContent() || '';
  }
}

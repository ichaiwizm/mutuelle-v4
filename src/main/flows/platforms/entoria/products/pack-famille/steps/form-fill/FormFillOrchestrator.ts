/**
 * FormFillOrchestrator pour Entoria TNS Santé
 * Formulaire de tarification en 4 étapes
 */

import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';
import type { PackFamilleFormData } from '../../transformers/types';
import { ENTORIA_SELECTORS } from './selectors';

export class FormFillOrchestrator {
  /**
   * Remplit l'étape 1 : Profil de l'entrepreneur
   */
  async fillProfil(page: Page, data: PackFamilleFormData, logger?: FlowLogger): Promise<void> {
    logger?.info('Filling step 1: Profil');
    const { profil } = data;
    const selectors = ENTORIA_SELECTORS.profil;

    // 1. Date de naissance
    const dateInput = page.locator(selectors.date_naissance.primary).first();
    await dateInput.waitFor({ state: 'visible', timeout: 10000 });
    await dateInput.fill(profil.date_naissance);
    logger?.debug('Filled date_naissance', { value: profil.date_naissance });

    // 2. Profession (autocomplete)
    const professionInput = page.locator(selectors.profession.primary).first();
    await professionInput.click();
    await professionInput.fill(profil.profession);
    await page.waitForTimeout(1000);

    // Sélectionner la première option
    const professionOption = page.locator(ENTORIA_SELECTORS.common.mat_option).first();
    if (await professionOption.isVisible()) {
      await professionOption.click();
      logger?.debug('Selected profession', { value: profil.profession });
    }

    await page.waitForTimeout(1000);

    // 3. Le client exerce en tant que (conditionnel)
    const exerceInput = page.locator(selectors.exerce_en_tant_que.primary).first();
    if (await exerceInput.isVisible()) {
      await exerceInput.click();
      await page.waitForTimeout(500);

      const exerceOption = page.locator(ENTORIA_SELECTORS.common.mat_option).first();
      if (await exerceOption.isVisible()) {
        await exerceOption.click();
        logger?.debug('Selected exerce_en_tant_que');
      }
    }

    await page.waitForTimeout(500);

    // 4. Département de résidence (mat-select)
    const deptSelect = page.locator(selectors.departement.primary).first();
    await deptSelect.click();
    await page.waitForTimeout(500);

    // Chercher le département
    const deptOption = page.locator(`mat-option:has-text("${profil.departement_residence}")`).first();
    if (await deptOption.isVisible()) {
      await deptOption.click();
      logger?.debug('Selected departement', { value: profil.departement_residence });
    } else {
      // Taper le code département
      await page.keyboard.type(profil.departement_residence);
      await page.waitForTimeout(500);
      await page.locator(ENTORIA_SELECTORS.common.mat_option).first().click();
    }

    // 5. Prévoyance chez ENTORIA
    const prevSelector = profil.assure_prevoyance_entoria
      ? selectors.prevoyance_entoria.oui
      : selectors.prevoyance_entoria.non;
    await page.locator(prevSelector).first().click();
    logger?.debug('Selected prevoyance_entoria', { value: profil.assure_prevoyance_entoria });

    await page.waitForTimeout(1000);

    logger?.info('Completed step 1: Profil');
  }

  /**
   * Clique sur CONTINUER pour passer à l'étape 2
   */
  async submitProfil(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.info('Submitting step 1');

    // Utiliser getByRole pour une meilleure compatibilité Angular Material
    const continuerBtn = page.getByRole('button', { name: /continuer/i });
    await continuerBtn.waitFor({ state: 'visible', timeout: 5000 });

    // Attendre que le bouton soit activé (Angular validation)
    await page.waitForFunction(
      () => {
        // Chercher un bouton contenant "CONTINUER" sans utiliser :has-text
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent?.toUpperCase().includes('CONTINUER'));
        return btn && !btn.disabled;
      },
      { timeout: 10000 }
    );

    await continuerBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    logger?.info('Moved to step 2');
  }

  /**
   * Remplit l'étape 2 : Recueil des besoins
   */
  async fillBesoin(page: Page, data: PackFamilleFormData, logger?: FlowLogger): Promise<void> {
    logger?.info('Filling step 2: Besoin');
    const { besoin } = data;
    const selectors = ENTORIA_SELECTORS.besoin;

    // Hospitalisation uniquement ?
    const btnSelector = besoin.hospitalisation_uniquement
      ? selectors.hospitalisation_oui.primary
      : selectors.hospitalisation_non.primary;

    const btn = page.locator(btnSelector).first();
    await btn.waitFor({ state: 'visible', timeout: 5000 });
    await btn.click();
    logger?.debug('Selected hospitalisation_uniquement', { value: besoin.hospitalisation_uniquement });

    await page.waitForTimeout(1000);

    logger?.info('Completed step 2: Besoin');
  }

  /**
   * Clique sur suivant pour passer à l'étape 3
   */
  async submitBesoin(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.info('Submitting step 2');

    const suivantBtn = page.locator(ENTORIA_SELECTORS.besoin.suivant.primary);
    await suivantBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    logger?.info('Moved to step 3');
  }

  /**
   * Ferme un éventuel modal d'erreur de date
   */
  private async dismissDateEffetModal(page: Page, logger?: FlowLogger): Promise<void> {
    try {
      const okButton = page.getByRole('button', { name: 'OK' });
      if (await okButton.isVisible({ timeout: 1000 })) {
        await okButton.click();
        logger?.debug('Dismissed date effet modal');
        await page.waitForTimeout(500);
      }
    } catch {
      // Pas de modal, c'est normal
    }
  }

  /**
   * Remplit l'étape 3 : Choix des garanties
   */
  async fillGaranties(page: Page, data: PackFamilleFormData, logger?: FlowLogger): Promise<void> {
    logger?.info('Filling step 3: Garanties');
    const { garanties } = data;
    const selectors = ENTORIA_SELECTORS.garanties;

    // Attendre que la page soit prête
    await page.waitForTimeout(1000);

    // 1. Fréquence de règlement
    const freqSelector = garanties.frequence_reglement === 'Mensuelle'
      ? selectors.frequence.mensuelle
      : selectors.frequence.trimestrielle;
    await page.locator(freqSelector).first().click();
    logger?.debug('Selected frequence', { value: garanties.frequence_reglement });

    // 2. Date d'effet (peut être pré-remplie)
    const dateEffetInput = page.locator(selectors.date_effet.primary).first();
    if (await dateEffetInput.isVisible()) {
      const currentValue = await dateEffetInput.inputValue();
      if (!currentValue || currentValue !== garanties.date_effet) {
        await dateEffetInput.clear();
        await dateEffetInput.fill(garanties.date_effet);
        // Cliquer ailleurs pour déclencher la validation
        await page.keyboard.press('Tab');
        await page.waitForTimeout(500);
        // Fermer le modal d'erreur si la date est invalide
        await this.dismissDateEffetModal(page, logger);
        logger?.debug('Filled date_effet', { value: garanties.date_effet });
      }
    }

    await page.waitForTimeout(1000);

    // 3. Ajouter conjoint si nécessaire
    if (garanties.avec_conjoint) {
      const conjointBtn = page.getByRole('button', { name: 'Son conjoint' });
      if (await conjointBtn.isVisible({ timeout: 2000 })) {
        await conjointBtn.click({ force: true });
        logger?.debug('Added conjoint');
        await page.waitForTimeout(2000);
      }
    }

    // 4. Ajouter enfants si nécessaire
    if (garanties.avec_enfants) {
      const enfantsBtn = page.getByRole('button', { name: /enfant/i });
      if (await enfantsBtn.isVisible({ timeout: 2000 })) {
        await enfantsBtn.click({ force: true });
        logger?.debug('Added enfants');
        await page.waitForTimeout(2000);
      }
    }

    logger?.info('Completed step 3: Garanties');
  }

  /**
   * Exécute le flow complet
   */
  async fillAll(page: Page, data: PackFamilleFormData, logger?: FlowLogger): Promise<void> {
    // Étape 1
    await this.fillProfil(page, data, logger);
    await this.submitProfil(page, logger);

    // Étape 2
    await this.fillBesoin(page, data, logger);
    await this.submitBesoin(page, logger);

    // Étape 3
    await this.fillGaranties(page, data, logger);

    logger?.info('All steps completed');
  }
}

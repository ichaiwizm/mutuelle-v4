/**
 * Section Profil - Étape 1 du formulaire Entoria TNS Santé
 */

import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import type { PackFamilleFormData } from '../../../transformers/types';
import { ENTORIA_SELECTORS } from '../selectors';

export class ProfilFill {
  /**
   * Remplit l'étape 1 : Profil de l'entrepreneur
   */
  async fill(page: Page, data: PackFamilleFormData, logger?: FlowLogger): Promise<void> {
    logger?.info('Filling step 1: Profil');
    const { profil } = data;
    const selectors = ENTORIA_SELECTORS.profil;

    // 1. Date de naissance
    const dateInput = page.locator(selectors.date_naissance.primary).first();
    await dateInput.waitFor({ state: 'visible', timeout: 10000 });
    await dateInput.fill(profil.date_naissance);
    logger?.debug('Filled date_naissance', { value: profil.date_naissance });

    // 2. Profession (autocomplete - valeurs EXACTES du dropdown Entoria)
    await this.fillProfession(page, profil.profession, logger);

    // Attendre que le champ soit validé par Angular
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
   * Remplit le champ profession avec stratégie de retry
   */
  private async fillProfession(page: Page, profession: string, logger?: FlowLogger): Promise<void> {
    const selectors = ENTORIA_SELECTORS.profil;
    const professionInput = page.locator(selectors.profession.primary).first();
    await professionInput.click();
    await professionInput.clear();

    logger?.debug('Filling profession', { profession });

    // Stratégie: taper progressivement jusqu'à trouver l'option EXACTE
    const exactOption = page.locator(`mat-option:has-text("${profession}")`).first();

    // Essai 1: Taper le texte complet (ou premiers 20 caractères)
    const searchText = profession.substring(0, 20);
    await professionInput.pressSequentially(searchText, { delay: 80 });
    await page.waitForTimeout(2000);

    let optionFound = await exactOption.isVisible().catch(() => false);

    if (!optionFound) {
      // Essai 2: Effacer et taper seulement le premier segment (avant la virgule)
      logger?.debug('Option not found with full text, trying first segment...');
      await professionInput.clear();
      await page.waitForTimeout(500);

      const firstSegment = profession.split(',')[0].trim();
      await professionInput.pressSequentially(firstSegment, { delay: 80 });
      await page.waitForTimeout(2000);

      optionFound = await exactOption.isVisible().catch(() => false);
    }

    if (!optionFound) {
      // Essai 3: Taper seulement les 5 premiers caractères (filtrage large)
      logger?.debug('Option not found with segment, trying short prefix...');
      await professionInput.clear();
      await page.waitForTimeout(500);

      const shortPrefix = profession.substring(0, 5);
      await professionInput.pressSequentially(shortPrefix, { delay: 100 });
      await page.waitForTimeout(2500);

      optionFound = await exactOption.isVisible().catch(() => false);
    }

    if (optionFound) {
      await exactOption.click();
      logger?.debug('Selected profession from dropdown', { value: profession });
    } else {
      // ERREUR: La profession n'a pas été trouvée - NE PAS sélectionner une mauvaise option
      const errorMsg = `Profession "${profession}" not found in dropdown. Check profession-mapper.ts for valid mappings.`;
      logger?.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Clique sur CONTINUER pour passer à l'étape 2
   */
  async submit(page: Page, logger?: FlowLogger): Promise<void> {
    logger?.info('Submitting step 1');

    // Utiliser getByRole pour une meilleure compatibilité Angular Material
    const continuerBtn = page.getByRole('button', { name: /continuer/i });
    await continuerBtn.waitFor({ state: 'visible', timeout: 5000 });

    // Attendre que le bouton soit activé (Angular validation)
    await page.waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent?.toUpperCase().includes('CONTINUER'));
        return btn && !btn.disabled;
      },
      { timeout: 10000 }
    );

    await continuerBtn.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    logger?.info('Moved to step 2');
  }
}

import type { Page } from 'playwright';
import type { AlptisFormData } from '../../transformers/types';
import { ERROR_SELECTORS } from './selectors';
import {
  fillRemplacementContrat,
  fillDemandeResiliation,
  fillDateEffet,
  fillCivilite,
  fillNom,
  fillPrenom,
  fillDateNaissance,
  fillCategorieSocioprofessionnelle,
  fillRegimeObligatoire,
  fillCodePostal,
  fillToggleConjoint,
} from './field-fillers';

/**
 * FormFillStep - Fills Alptis Santé Select form
 * Sections implemented:
 * - Section 1: Mise en place du contrat (complete - 3/3 fields)
 * - Section 2: Adhérent(e) (complete - 7/7 fields)
 * - Section 3: Conjoint(e) (partial - 1/4 fields: toggle only)
 */
export class FormFillStep {
  /**
   * Fill Section 1: Mise en place du contrat
   */
  async fillMiseEnPlace(page: Page, data: AlptisFormData): Promise<void> {
    console.log('--- SECTION: Mise en place du contrat ---');

    await fillRemplacementContrat(page, data.mise_en_place.remplacement_contrat);

    if (data.mise_en_place.remplacement_contrat && data.mise_en_place.demande_resiliation) {
      await fillDemandeResiliation(page, data.mise_en_place.demande_resiliation);
    }

    await fillDateEffet(page, data.mise_en_place.date_effet);

    console.log('✅ Section "Mise en place du contrat" complétée');
    console.log('---');
  }

  /**
   * Fill Section 2: Adhérent(e) (complete - 7/7 fields)
   */
  async fillAdherent(page: Page, data: AlptisFormData): Promise<void> {
    console.log('--- SECTION: Adhérent(e) ---');

    // Scroll to section
    await page.evaluate(() => {
      const section = Array.from(document.querySelectorAll('h2, h3, div')).find(el =>
        el.textContent?.includes('Adhérent')
      );
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await page.waitForTimeout(500);

    await fillCivilite(page, data.adherent.civilite);
    await fillNom(page, data.adherent.nom);
    await fillPrenom(page, data.adherent.prenom);
    await fillDateNaissance(page, data.adherent.date_naissance);
    await fillCategorieSocioprofessionnelle(page, data.adherent.categorie_socioprofessionnelle);
    await fillRegimeObligatoire(page, data.adherent.regime_obligatoire);
    await fillCodePostal(page, data.adherent.code_postal);

    console.log('✅ Section "Adhérent(e)" complétée (7/7 champs)');
    console.log('---');
  }

  /**
   * Fill Section 3: Conjoint(e) - Toggle only (partial - 1/4 fields)
   */
  async fillConjointToggle(page: Page, hasConjoint: boolean): Promise<void> {
    console.log('--- SECTION: Conjoint(e) ---');

    // Scroll to section
    await page.evaluate(() => {
      const section = Array.from(document.querySelectorAll('h2, h3, div')).find(el =>
        el.textContent?.includes('Conjoint')
      );
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await page.waitForTimeout(500);

    await fillToggleConjoint(page, hasConjoint);

    console.log(`✅ Section "Conjoint(e)" toggle complétée (1/4 champs)`);
    console.log('---');
  }

  /**
   * Check for validation errors
   */
  async checkForErrors(page: Page): Promise<string[]> {
    const errorLocator = page.locator(ERROR_SELECTORS.generic);
    const errorCount = await errorLocator.count();

    if (errorCount > 0) {
      const errors = await errorLocator.allTextContents();
      console.error('❌ Erreurs de validation trouvées:', errors);
      return errors;
    }

    return [];
  }
}

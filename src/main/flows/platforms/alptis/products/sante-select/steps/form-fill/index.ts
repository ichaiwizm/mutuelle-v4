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
  fillCadreExercice,
  fillRegimeObligatoire,
  fillCodePostal,
  fillToggleConjoint,
  fillConjointDateNaissance,
  fillConjointCategorieSocioprofessionnelle,
  fillConjointCadreExercice,
  fillConjointRegimeObligatoire,
  fillToggleEnfants,
  fillEnfantDateNaissance,
  fillEnfantRegimeObligatoire,
  clickAjouterEnfant,
} from './field-fillers';

/**
 * FormFillStep - Fills Alptis Santé Select form
 * Sections implemented:
 * - Section 1: Mise en place du contrat (complete - 3/3 fields)
 * - Section 2: Adhérent(e) (complete - 8/8 fields including conditional cadre_exercice)
 * - Section 3: Conjoint(e) (complete - 5/5 fields: toggle + 4 form fields including conditional cadre_exercice)
 * - Section 4: Enfant(s) (partial - 1/N fields: toggle only)
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
   * Fill Section 2: Adhérent(e) (complete - 8/8 fields including conditional cadre_exercice)
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

    // Cadre d'exercice is conditional - only appears for certain professions
    if (data.adherent.cadre_exercice) {
      await fillCadreExercice(page, data.adherent.cadre_exercice);
    }

    await fillRegimeObligatoire(page, data.adherent.regime_obligatoire);
    await fillCodePostal(page, data.adherent.code_postal);

    const fieldCount = data.adherent.cadre_exercice ? '8/8' : '7/7';
    console.log(`✅ Section "Adhérent(e)" complétée (${fieldCount} champs)`);
    console.log('---');
  }

  /**
   * Fill Section 3: Conjoint(e) - Toggle only (partial - 1/5 fields)
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

    console.log(`✅ Section "Conjoint(e)" toggle complétée (1/5 champs)`);
    console.log('---');
  }

  /**
   * Fill Section 3: Conjoint(e) - Complete form (4/4 fields including conditional cadre_exercice)
   * Note: This should be called AFTER fillConjointToggle when hasConjoint is true
   */
  async fillConjoint(page: Page, data: AlptisFormData['conjoint']): Promise<void> {
    if (!data) {
      console.log('⏭️ Pas de données conjoint, remplissage ignoré');
      return;
    }

    console.log('--- SECTION: Conjoint(e) - Formulaire ---');

    // Wait for form fields to appear after toggle
    await page.waitForTimeout(500);

    // Fill all fields
    await fillConjointDateNaissance(page, data.date_naissance);
    await fillConjointCategorieSocioprofessionnelle(page, data.categorie_socioprofessionnelle);

    // Cadre d'exercice is conditional - only appears for certain professions
    if (data.cadre_exercice) {
      await fillConjointCadreExercice(page, data.cadre_exercice);
    }

    await fillConjointRegimeObligatoire(page, data.regime_obligatoire);

    const fieldCount = data.cadre_exercice ? '4/4' : '3/3';
    console.log(`✅ Section "Conjoint(e)" formulaire complété (${fieldCount} champs)`);
    console.log('---');
  }

  /**
   * Fill Section 4: Enfant(s) - Toggle only (partial - 1/N fields)
   */
  async fillEnfantsToggle(page: Page, hasEnfants: boolean): Promise<void> {
    console.log('--- SECTION: Enfant(s) ---');
    await fillToggleEnfants(page, hasEnfants);
    console.log(`✅ Section "Enfant(s)" toggle complétée (1/N champs)`);
    console.log('---');
  }

  /**
   * Fill Section 4: Enfant(s) - All children (2/2 fields per child)
   * Note: This should be called AFTER fillEnfantsToggle when hasEnfants is true
   */
  async fillEnfants(page: Page, enfants: AlptisFormData['enfants']): Promise<void> {
    if (!enfants || enfants.length === 0) {
      console.log('⏭️ Pas de données enfants, remplissage ignoré');
      return;
    }

    console.log('--- SECTION: Enfant(s) - Formulaire ---');

    // Wait for form fields to appear after toggle
    await page.waitForTimeout(500);

    // Fill all children
    for (let i = 0; i < enfants.length; i++) {
      const enfant = enfants[i];

      // For second child and beyond, click "Ajouter un enfant" button first
      if (i > 0) {
        console.log(`➕ Ajout enfant ${i + 1}/${enfants.length}`);
        await clickAjouterEnfant(page, i + 1); // Pass child number (2, 3, 4, etc.)
      }

      // Fill child's data (date + regime)
      await fillEnfantDateNaissance(page, enfant.date_naissance, i);
      await fillEnfantRegimeObligatoire(page, enfant.regime_obligatoire, i);

      console.log(`✅ Enfant ${i + 1}/${enfants.length} rempli (2/2 champs)`);
    }

    console.log(`✅ Section "Enfant(s)" formulaire complété (${enfants.length * 2}/${enfants.length * 2} champs pour ${enfants.length} enfant(s))`);
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

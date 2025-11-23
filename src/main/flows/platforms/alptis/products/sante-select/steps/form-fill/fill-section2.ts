import type { Page } from 'playwright';
import { SECTION_2_SELECTORS } from './selectors';
import { verifyTextValue } from './verifiers';
import { blurField, clearAndType } from './actions';
import {
  fillDateField,
  fillCadreExerciceField,
  fillCategorieSocioprofessionnelleField,
  fillRegimeObligatoireField,
} from './operations';

// Champs Section 2
export async function fillCivilite(page: Page, civilite: 'monsieur' | 'madame'): Promise<void> {
  console.log(`[1/4] Civilité: ${civilite}`);
  const label = page.locator(`label:has-text("${civilite === 'monsieur' ? 'Monsieur' : 'Madame'}")`).first();
  await label.waitFor({ state: 'visible', timeout: 5000 });
  await label.click();
}

export async function fillNom(page: Page, nom: string): Promise<void> {
  console.log(`[2/4] Nom: ${nom}`);
  await clearAndType(page.locator(SECTION_2_SELECTORS.nom.primary), nom);
  await verifyTextValue(page, page.locator(SECTION_2_SELECTORS.nom.primary), nom);
}

export async function fillPrenom(page: Page, prenom: string): Promise<void> {
  console.log(`[3/4] Prénom: ${prenom}`);
  await clearAndType(page.locator(SECTION_2_SELECTORS.prenom.primary), prenom);
  await verifyTextValue(page, page.locator(SECTION_2_SELECTORS.prenom.primary), prenom);
  await blurField(page);
}

export async function fillDateNaissance(page: Page, dateNaissance: string): Promise<void> {
  await fillDateField(page, dateNaissance, 1, '[4/4] Date de naissance');
}

export async function fillCategorieSocioprofessionnelle(page: Page, value: string): Promise<void> {
  await fillCategorieSocioprofessionnelleField(
    page,
    value,
    0, // adherent is first (index 0)
    '[5/8] Catégorie',
    SECTION_2_SELECTORS.categorie_socioprofessionnelle.primary
  );
}

export async function fillCadreExercice(page: Page, value: 'SALARIE' | 'INDEPENDANT_PRESIDENT_SASU_SAS'): Promise<void> {
  await fillCadreExerciceField(
    page,
    value,
    0, // adherent is first (index 0)
    "[6/8] Cadre d'exercice"
  );
}

export async function fillRegimeObligatoire(page: Page, value: string): Promise<void> {
  await fillRegimeObligatoireField(
    page,
    value,
    0, // adherent is first (index 0)
    '[7/8] Régime',
    SECTION_2_SELECTORS.regime_obligatoire.primary
  );
}

export async function fillCodePostal(page: Page, codePostal: string): Promise<void> {
  console.log(`[8/8] Code postal: ${codePostal}`);
  await clearAndType(page.locator(SECTION_2_SELECTORS.code_postal.primary), codePostal);
  await verifyTextValue(page, page.locator(SECTION_2_SELECTORS.code_postal.primary), codePostal);
}

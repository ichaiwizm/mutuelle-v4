import type { Page } from 'playwright';
import { SECTION_2_SELECTORS } from './selectors';
import { verifyTextValue, verifyDateValue, verifySelectValue } from './verifiers';
import { blurField, clearAndType } from './actions';
import { PROFESSION_LABELS } from './mappers/profession-labels';
import type { AlptisProfession } from '../../transformers/types';

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
  console.log(`[4/4] Date de naissance: ${dateNaissance}`);
  const locator = page.locator(SECTION_2_SELECTORS.date_naissance.primary).nth(1);
  await clearAndType(locator, dateNaissance);
  await verifyDateValue(page, locator, dateNaissance);
  await blurField(page);
}

export async function fillCategorieSocioprofessionnelle(page: Page, value: string): Promise<void> {
  console.log(`[5/8] Catégorie: ${value}`);
  const label = PROFESSION_LABELS[value as AlptisProfession];
  if (!label) throw new Error(`Label inconnu: ${value}`);

  const textbox = page.getByRole('textbox', { name: /catégorie socioprofessionnelle/i });
  await textbox.click();
  await textbox.fill(label);
  await page.waitForTimeout(500);

  await page.locator('.totem-select-option__label').filter({ hasText: label }).first().click();
  await verifySelectValue(page, page.locator(SECTION_2_SELECTORS.categorie_socioprofessionnelle.primary), value);
}

export async function fillCadreExercice(page: Page, value: 'SALARIE' | 'INDEPENDANT_PRESIDENT_SASU_SAS'): Promise<void> {
  console.log(`[6/8] Cadre d'exercice: ${value}`);
  const labelText = value === 'SALARIE' ? 'Salarié' : 'Indépendant Président SASU/SAS';
  const label = page.locator(`label:has-text("${labelText}")`).first();
  await label.waitFor({ state: 'visible', timeout: 5000 });
  await label.click();
  console.log(`  ↳ Option "${labelText}" sélectionnée`);
}

export async function fillRegimeObligatoire(page: Page, value: string): Promise<void> {
  console.log(`[7/8] Régime: ${value}`);
  const labels: Record<string, string> = {
    ALSACE_MOSELLE: 'Alsace / Moselle',
    AMEXA: 'Amexa',
    REGIME_SALARIES_AGRICOLES: 'Régime des salariés agricoles',
    SECURITE_SOCIALE: 'Sécurité sociale',
    SECURITE_SOCIALE_INDEPENDANTS: 'Sécurité sociale des indépendants',
  };

  const label = labels[value];
  if (!label) throw new Error(`Label inconnu: ${value}`);

  const textbox = page.getByRole('textbox', { name: /régime obligatoire/i });
  await textbox.click();
  await textbox.fill(label);
  await page.waitForTimeout(700);

  // Match exact du texte (important: "Sécurité sociale" vs "Sécurité sociale des indépendants")
  const options = await page.locator('.totem-select-option__label:visible').all();
  for (const opt of options) {
    if ((await opt.textContent())?.trim() === label) {
      await opt.click();
      await page.waitForTimeout(300);
      await verifySelectValue(page, page.locator(SECTION_2_SELECTORS.regime_obligatoire.primary), value);
      return;
    }
  }
  throw new Error(`Option "${label}" not found`);
}

export async function fillCodePostal(page: Page, codePostal: string): Promise<void> {
  console.log(`[8/8] Code postal: ${codePostal}`);
  await clearAndType(page.locator(SECTION_2_SELECTORS.code_postal.primary), codePostal);
  await verifyTextValue(page, page.locator(SECTION_2_SELECTORS.code_postal.primary), codePostal);
}

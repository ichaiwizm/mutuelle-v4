import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';
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
export async function fillCivilite(page: Page, civilite: 'monsieur' | 'madame', logger?: FlowLogger): Promise<void> {
  logger?.debug('Filling civilité', { civilite, field: '1/4' });
  const label = page.locator(`label:has-text("${civilite === 'monsieur' ? 'Monsieur' : 'Madame'}")`).first();
  await label.waitFor({ state: 'visible', timeout: 5000 });
  await label.click();
}

export async function fillNom(page: Page, nom: string, logger?: FlowLogger): Promise<void> {
  logger?.debug('Filling nom', { nom, field: '2/4' });
  await clearAndType(page.locator(SECTION_2_SELECTORS.nom.primary), nom);
  await verifyTextValue(page, page.locator(SECTION_2_SELECTORS.nom.primary), nom);
}

export async function fillPrenom(page: Page, prenom: string, logger?: FlowLogger): Promise<void> {
  logger?.debug('Filling prénom', { prenom, field: '3/4' });
  await clearAndType(page.locator(SECTION_2_SELECTORS.prenom.primary), prenom);
  await verifyTextValue(page, page.locator(SECTION_2_SELECTORS.prenom.primary), prenom);
  await blurField(page);
}

export async function fillDateNaissance(page: Page, dateNaissance: string, logger?: FlowLogger): Promise<void> {
  await fillDateField(page, dateNaissance, 1, '[4/4] Date de naissance', logger);
}

export async function fillCategorieSocioprofessionnelle(page: Page, value: string, logger?: FlowLogger): Promise<void> {
  await fillCategorieSocioprofessionnelleField(
    page,
    value,
    0, // adherent is first (index 0)
    '[5/8] Catégorie',
    SECTION_2_SELECTORS.categorie_socioprofessionnelle.primary,
    logger
  );
}

export async function fillCadreExercice(page: Page, value: 'SALARIE' | 'INDEPENDANT_PRESIDENT_SASU_SAS', logger?: FlowLogger): Promise<void> {
  await fillCadreExerciceField(
    page,
    value,
    0, // adherent is first (index 0)
    "[6/8] Cadre d'exercice",
    logger
  );
}

export async function fillRegimeObligatoire(page: Page, value: string, logger?: FlowLogger): Promise<void> {
  await fillRegimeObligatoireField(
    page,
    value,
    0, // adherent is first (index 0)
    '[7/8] Régime',
    SECTION_2_SELECTORS.regime_obligatoire.primary,
    logger
  );
}

export async function fillCodePostal(page: Page, codePostal: string, logger?: FlowLogger): Promise<void> {
  logger?.debug('Filling code postal', { codePostal, field: '8/8' });
  await clearAndType(page.locator(SECTION_2_SELECTORS.code_postal.primary), codePostal);
  await verifyTextValue(page, page.locator(SECTION_2_SELECTORS.code_postal.primary), codePostal);
}

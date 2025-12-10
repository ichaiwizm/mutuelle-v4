/**
 * Verification helpers for Santé Pro Plus transformer tests
 */
import { expect } from '@playwright/test';
import type { SanteProPlusFormData } from '../../../src/main/flows/platforms/alptis/products/sante-pro-plus/transformers/types';
import type { Lead } from '../../../src/shared/types/lead';

/**
 * Verify all sections of transformed data for Santé Pro Plus
 */
export function verifySanteProPlusTransformedData(transformed: SanteProPlusFormData, lead: Lead, index: number): void {
  const emailNumber = String(index + 1).padStart(3, '0');

  console.log(`\n TRANSFORMED DATA (SANTE PRO PLUS) - email-${emailNumber}:`);
  console.log('Mise en place:', transformed.mise_en_place);
  console.log('Adherent:', {
    civilite: transformed.adherent.civilite,
    nom: transformed.adherent.nom,
    prenom: transformed.adherent.prenom,
    micro_entrepreneur: transformed.adherent.micro_entrepreneur,
    ville: transformed.adherent.ville,
    statut_professionnel: transformed.adherent.statut_professionnel,
  });

  // Verify mise_en_place
  expect(transformed.mise_en_place).toHaveProperty('date_effet');
  expect(transformed.mise_en_place.date_effet).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);

  // Verify adherent - common fields
  expect(transformed.adherent.civilite).toMatch(/^(monsieur|madame)$/);
  expect(transformed.adherent.nom).toBeDefined();
  expect(transformed.adherent.prenom).toBeDefined();
  expect(transformed.adherent.date_naissance).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  expect(transformed.adherent.categorie_socioprofessionnelle).toBeDefined();
  expect(transformed.adherent.regime_obligatoire).toBeDefined();
  expect(transformed.adherent.code_postal).toMatch(/^\d{5}$/);

  // Verify adherent - Santé Pro Plus specific fields
  expect(transformed.adherent.micro_entrepreneur).toMatch(/^(Oui|Non)$/);
  // ville peut être vide car elle sera remplie par le formulaire via le code postal
  expect(transformed.adherent.ville).toBeDefined();

  // cadre_exercice is conditional (only for certain professions)
  if (transformed.adherent.cadre_exercice) {
    expect(transformed.adherent.cadre_exercice).toMatch(/^(SALARIE|INDEPENDANT_PRESIDENT_SASU_SAS)$/);
  }

  // statut_professionnel is conditional (only for CHEFS_D_ENTREPRISE)
  if (transformed.adherent.statut_professionnel) {
    expect(transformed.adherent.statut_professionnel).toMatch(/^(ARTISAN_COMMERCANT|PROFESSIONS_LIBERALES)$/);
  }

  // Verify optional sections - conjoint (simplifié pour Santé Pro Plus)
  if (transformed.conjoint) {
    console.log('Conjoint: present (simplified - no cadre_exercice)');
    expect(transformed.conjoint.date_naissance).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(transformed.conjoint.categorie_socioprofessionnelle).toBeDefined();
    expect(transformed.conjoint.regime_obligatoire).toBeDefined();
    // Santé Pro Plus n'a PAS de cadre_exercice pour le conjoint
    expect(transformed.conjoint).not.toHaveProperty('cadre_exercice');
  }

  // Verify enfants
  if (transformed.enfants) {
    console.log(`Enfants: ${transformed.enfants.length}`);
    transformed.enfants.forEach((enfant, i) => {
      expect(enfant.date_naissance).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(enfant.regime_obligatoire).toBeDefined();
    });
  }

  console.log(`Lead #${index + 1} transformed successfully (Sante Pro Plus)`);
}

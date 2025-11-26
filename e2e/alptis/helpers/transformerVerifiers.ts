/**
 * Verification helpers for transformer tests
 */
import { expect } from '@playwright/test';
import type { AlptisFormData } from '../../../src/main/flows/platforms/alptis/products/sante-select/transformers/types';
import type { Lead } from '../../../src/shared/types/lead';

/**
 * Verify all sections of transformed data
 */
export function verifyTransformedData(transformed: AlptisFormData, lead: Lead, index: number): void {
  const emailNumber = String(index + 1).padStart(3, '0');

  console.log(`\n📤 TRANSFORMED DATA - email-${emailNumber}:`);
  console.log('Mise en place:', transformed.mise_en_place);
  console.log('Adhérent:', {
    civilite: transformed.adherent.civilite,
    nom: transformed.adherent.nom,
    prenom: transformed.adherent.prenom,
  });

  // Verify mise_en_place
  expect(transformed.mise_en_place).toHaveProperty('date_effet');
  expect(transformed.mise_en_place.date_effet).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);

  // Verify adherent
  expect(transformed.adherent.civilite).toMatch(/^(monsieur|madame)$/);
  expect(transformed.adherent.nom).toBeDefined();
  expect(transformed.adherent.prenom).toBeDefined();
  expect(transformed.adherent.date_naissance).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  expect(transformed.adherent.categorie_socioprofessionnelle).toBeDefined();
  expect(transformed.adherent.regime_obligatoire).toBeDefined();
  expect(transformed.adherent.code_postal).toMatch(/^\d{5}$/);

  // Verify optional sections
  if (transformed.conjoint) {
    console.log('Conjoint: present');
    expect(transformed.conjoint.date_naissance).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  }

  if (transformed.enfants) {
    console.log(`Enfants: ${transformed.enfants.length}`);
    transformed.enfants.forEach((enfant, i) => {
      expect(enfant.date_naissance).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(enfant.regime_obligatoire).toBeDefined();
    });
  }

  console.log(`✅ Lead #${index + 1} transformed successfully`);
}

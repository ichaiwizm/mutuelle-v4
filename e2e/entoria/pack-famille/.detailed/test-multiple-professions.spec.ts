/**
 * Test du mapping de différentes professions
 * Vérifie que le LeadTransformer mappe correctement les professions
 */

import { test, expect } from '@playwright/test';
import { LeadTransformer } from '../../../../src/main/flows/platforms/entoria/products/pack-famille/transformers/LeadTransformer';
import { mapProfession } from '../../../../src/main/flows/platforms/entoria/products/pack-famille/transformers/mappers/profession-mapper';
import type { Lead } from '../../../../src/main/flows/platforms/entoria/products/pack-famille/transformers/types';

// Cas de test : profession input → profession attendue
const PROFESSION_TEST_CASES = [
  { input: 'Profession libérale', expected: 'GÉRANT, CHEF D\'ENTREPRISE DE SERVICES' },
  { input: 'profession libérale', expected: 'GÉRANT, CHEF D\'ENTREPRISE DE SERVICES' },
  { input: 'artisan', expected: 'ARTISAN DES MÉTIERS DE BOUCHE' },
  { input: 'Artisan', expected: 'ARTISAN DES MÉTIERS DE BOUCHE' },
  { input: 'commerçant', expected: 'COMMERÇANT' },
  { input: 'Commerçant', expected: 'COMMERÇANT' },
  { input: 'commercant', expected: 'COMMERÇANT' },
  { input: 'agriculteur', expected: 'AGRICULTEUR, ÉLEVEUR' },
  { input: "chef d'entreprise", expected: 'GÉRANT, CHEF D\'ENTREPRISE COMMERCIALE' },
  { input: 'médecin', expected: 'MÉDECIN GÉNÉRALISTE' },
  { input: 'avocat', expected: 'AVOCAT' },
  { input: 'pharmacien', expected: 'PHARMACIEN' },
  { input: 'plombier', expected: 'PLOMBIER, CHAUFFAGISTE' },
  { input: 'informaticien', expected: 'CHEF DE PROJET, INFORMATICIEN' },
  { input: 'consultant', expected: 'AUTRE CONSULTANT, COACH (HORS SPORTS)' },
  { input: 'taxi', expected: 'TAXI, CHAUFFEUR, VTC' },
  { input: 'vtc', expected: 'TAXI, CHAUFFEUR, VTC' },
  // Cas avec valeur par défaut (profession inconnue)
  { input: 'astronaute', expected: 'GÉRANT, CHEF D\'ENTREPRISE DE SERVICES' },
  { input: '', expected: 'GÉRANT, CHEF D\'ENTREPRISE DE SERVICES' },
  { input: undefined, expected: 'GÉRANT, CHEF D\'ENTREPRISE DE SERVICES' },
];

test.describe('Entoria - Profession Mapping Tests', () => {
  test('mapProfession retourne les bonnes valeurs', () => {
    console.log('\n════════════════════════════════════════');
    console.log('   TEST MAPPING PROFESSIONS');
    console.log('════════════════════════════════════════\n');

    let passed = 0;
    let failed = 0;

    for (const testCase of PROFESSION_TEST_CASES) {
      const result = mapProfession(testCase.input as string | undefined);
      const status = result === testCase.expected ? '✅' : '❌';

      if (result === testCase.expected) {
        passed++;
      } else {
        failed++;
        console.log(`${status} "${testCase.input}" → "${result}" (attendu: "${testCase.expected}")`);
      }
    }

    console.log(`\n📊 Résultats: ${passed} passés, ${failed} échoués sur ${PROFESSION_TEST_CASES.length} tests`);

    expect(failed).toBe(0);
    console.log('\n✅ Tous les mappings sont corrects !');
  });

  test('LeadTransformer utilise bien mapProfession', () => {
    console.log('\n════════════════════════════════════════');
    console.log('   TEST LEADTRANSFORMER + MAPPROFESSION');
    console.log('════════════════════════════════════════\n');

    const testLead: Lead = {
      id: 'test-lead-mapping',
      subscriber: {
        civilite: 'M.',
        nom: 'Test',
        prenom: 'User',
        dateNaissance: '1985-06-20',
        email: 'test@example.com',
        telephone: '0600000000',
        adresse: '1 rue Test',
        codePostal: '69001',
        ville: 'Lyon',
        profession: 'Artisan', // Input générique
      },
      project: {
        dateEffet: '2025-03-01',
        type: 'sante',
      },
      children: [],
    };

    const result = LeadTransformer.transform(testLead);

    console.log(`Input: "${testLead.subscriber.profession}"`);
    console.log(`Output: "${result.profil.profession}"`);
    console.log(`Département: "${result.profil.departement_residence}"`);

    expect(result.profil.profession).toBe('ARTISAN DES MÉTIERS DE BOUCHE');
    expect(result.profil.departement_residence).toBe('69');

    console.log('\n✅ LeadTransformer transforme correctement !');
  });
});

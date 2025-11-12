/**
 * Tests manuels du produit Premium (sans Playwright)
 * Tests unitaires des adaptateurs
 */

import { ProfessionMapper } from './src/products/premium/professionMapper.js';
import { ValidationAdapter } from './src/products/premium/validationAdapter.js';
import { DataEnricher } from './src/products/premium/dataEnricher.js';
import { PremiumTransformer } from './src/products/premium/transformer.js';

console.log('\n🧪 TESTS EXHAUSTIFS DU PRODUIT PREMIUM\n');
console.log('='.repeat(60));

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    failedTests++;
  }
}

function assertEquals(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
  }
}

function assertTrue(condition, message = '') {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ============================================================================
// TEST 1: ProfessionMapper
// ============================================================================
console.log('\n📌 TEST 1: ProfessionMapper\n');

test('ProfessionMapper - Exact match: Salarié', () => {
  const result = ProfessionMapper.map('Salarié');
  assertEquals(result.formValue, 'Salarie');
  assertEquals(result.confidence, 'exact');
});

test('ProfessionMapper - Mapped: Profession libérale → Consultant', () => {
  const result = ProfessionMapper.map('Profession libérale');
  assertEquals(result.formValue, 'Consultant');
  assertEquals(result.confidence, 'mapped');
});

test('ProfessionMapper - Mapped: TNS → Independant', () => {
  const result = ProfessionMapper.map('TNS : régime des indépendants');
  assertEquals(result.formValue, 'Independant');
  assertEquals(result.confidence, 'mapped');
});

test('ProfessionMapper - Fuzzy: travail libéral → Consultant', () => {
  const result = ProfessionMapper.map('travail libéral');
  assertEquals(result.formValue, 'Consultant');
});

test('ProfessionMapper - Fallback: xyz123 → Autre', () => {
  const result = ProfessionMapper.map('xyz123');
  assertEquals(result.formValue, 'Autre');
  assertEquals(result.confidence, 'fallback');
});

test('ProfessionMapper - getAvailableOptions returns array', () => {
  const options = ProfessionMapper.getAvailableOptions();
  assertTrue(Array.isArray(options));
  assertTrue(options.length >= 10);
  assertTrue(options.includes('Consultant'));
});

test('ProfessionMapper - getMappingStats works', () => {
  const professions = ['Salarié', 'Profession libérale', 'xyz123'];
  const stats = ProfessionMapper.getMappingStats(professions);
  assertEquals(stats.total, 3);
  assertEquals(stats.exact, 1);
  assertEquals(stats.mapped, 1);
  assertEquals(stats.fallback, 1);
});

// ============================================================================
// TEST 2: ValidationAdapter
// ============================================================================
console.log('\n📌 TEST 2: ValidationAdapter\n');

test('ValidationAdapter - Valid date effet (+7j)', () => {
  const adapter = new ValidationAdapter();
  const today = new Date();
  const validDate = new Date(today);
  validDate.setDate(validDate.getDate() + 10);

  const formData = {
    dateEffet: validDate.toISOString().split('T')[0],
    dateNaissance: '1990-01-01',
    telephone: '06.12.34.56.78',
    codePostal: '75001'
  };

  const result = adapter.validate(formData);
  assertTrue(result.valid, 'Date +10j should be valid');
});

test('ValidationAdapter - Auto-adjust date effet too early', () => {
  const adapter = new ValidationAdapter();
  const today = new Date();
  const invalidDate = new Date(today);
  invalidDate.setDate(invalidDate.getDate() + 1); // +1j seulement

  const formData = {
    dateEffet: invalidDate.toISOString().split('T')[0],
    dateNaissance: '1990-01-01',
    telephone: '06.12.34.56.78',
    codePostal: '75001'
  };

  const { adapted, warnings } = adapter.adapt(formData);

  const adaptedDate = new Date(adapted.dateEffet);
  adaptedDate.setHours(0, 0, 0, 0); // Reset time for comparison

  const minDate = new Date(today);
  minDate.setHours(0, 0, 0, 0); // Reset time for comparison
  minDate.setDate(minDate.getDate() + 7);

  assertTrue(adaptedDate >= minDate, 'Date should be adjusted to +7j minimum');
  assertTrue(warnings.length > 0, 'Should have warnings');
});

test('ValidationAdapter - Auto-format telephone', () => {
  const adapter = new ValidationAdapter();
  const formData = {
    dateEffet: '2025-12-31',
    dateNaissance: '1990-01-01',
    telephone: '0612345678', // Sans points
    codePostal: '75001'
  };

  const { adapted } = adapter.adapt(formData);
  assertEquals(adapted.telephone, '06.12.34.56.78', 'Phone should be formatted');
});

test('ValidationAdapter - Auto-format code postal', () => {
  const adapter = new ValidationAdapter();
  const formData = {
    dateEffet: '2025-12-31',
    dateNaissance: '1990-01-01',
    telephone: '06.12.34.56.78',
    codePostal: '123' // Trop court
  };

  const { adapted } = adapter.adapt(formData);
  assertEquals(adapted.codePostal, '00123', 'Code postal should be padded');
});

// ============================================================================
// TEST 3: DataEnricher
// ============================================================================
console.log('\n📌 TEST 3: DataEnricher\n');

test('DataEnricher - Generate numero secu', () => {
  const lead = {
    id: 'test',
    subscriber: {},
    project: {}
  };

  const formData = {
    civilite: 'M.',
    dateNaissance: '1990-01-01',
    numeroSecuriteSociale: '',
    mutuelleActuelle: '',
    antecedentsMedicaux: undefined,
    profession: 'Salarie'
  };

  const { enriched, addedFields } = DataEnricher.enrich(lead, formData);

  assertTrue(enriched.numeroSecuriteSociale.length === 15, 'Numero secu should be 15 digits');
  assertTrue(addedFields.length > 0, 'Should have added fields');
});

test('DataEnricher - Set mutuelle actuelle based on actuellementAssure', () => {
  const lead = { id: 'test', subscriber: {}, project: {} };

  const formData = {
    civilite: 'M.',
    dateNaissance: '1990-01-01',
    numeroSecuriteSociale: '123456789012345',
    mutuelleActuelle: '',
    antecedentsMedicaux: false,
    profession: 'Salarie',
    actuellementAssure: false
  };

  const { enriched } = DataEnricher.enrich(lead, formData);
  assertEquals(enriched.mutuelleActuelle, 'Aucune');
});

test('DataEnricher - Set regime fiscal for TNS', () => {
  const lead = { id: 'test', subscriber: {}, project: {} };

  const formData = {
    civilite: 'M.',
    dateNaissance: '1990-01-01',
    numeroSecuriteSociale: '123456789012345',
    mutuelleActuelle: 'Aucune',
    antecedentsMedicaux: false,
    profession: 'Independant',
    actuellementAssure: false
  };

  const { enriched } = DataEnricher.enrich(lead, formData);
  assertEquals(enriched.regimeFiscal, 'Micro-entreprise');
});

// ============================================================================
// TEST 4: PremiumTransformer (intégration)
// ============================================================================
console.log('\n📌 TEST 4: PremiumTransformer (Intégration)\n');

test('PremiumTransformer - Complete transformation', () => {
  const lead = {
    id: 'test-123',
    subscriber: {
      civilite: 'M.',
      nom: 'DUPONT',
      prenom: 'Jean',
      dateNaissance: '15/03/1985',
      email: 'jean.dupont@example.com',
      telephone: '0612345678',
      adresse: '123 rue Test',
      codePostal: '75001',
      ville: 'Paris',
      profession: 'Profession libérale',
      regimeSocial: 'TNS'
    },
    project: {
      dateEffet: '01/12/2025',
      actuellementAssure: true,
      soinsMedicaux: 3,
      hospitalisation: 4,
      optique: 2,
      dentaire: 3
    },
    children: []
  };

  const transformer = new PremiumTransformer();
  const formData = transformer.transform(lead);

  // Vérifications
  assertEquals(formData.nom, 'DUPONT');
  assertEquals(formData.prenom, 'Jean');
  assertEquals(formData.profession, 'Consultant', 'Profession should be mapped');
  assertTrue(formData.numeroSecuriteSociale.length === 15, 'Numero secu should be generated');
  assertEquals(formData.telephone, '06.12.34.56.78', 'Phone should be formatted');
  assertTrue(formData.mutuelleActuelle !== '', 'Mutuelle should be set');
});

test('PremiumTransformer - Transform with children', () => {
  const lead = {
    id: 'test-456',
    subscriber: {
      civilite: 'Mme',
      nom: 'MARTIN',
      prenom: 'Sophie',
      dateNaissance: '10/05/1980',
      email: 'sophie.martin@example.com',
      telephone: '0712345678',
      adresse: '456 avenue Test',
      codePostal: '69001',
      ville: 'Lyon',
      profession: 'Salarié',
      regimeSocial: 'Général',
      nombreEnfants: 2
    },
    project: {
      dateEffet: '15/01/2026',
      actuellementAssure: false,
      soinsMedicaux: 2,
      hospitalisation: 2,
      optique: 2,
      dentaire: 2
    },
    children: [
      { dateNaissance: '05/03/2010' },
      { dateNaissance: '12/08/2015' }
    ]
  };

  const transformer = new PremiumTransformer();
  const formData = transformer.transform(lead);

  assertEquals(formData.nombreEnfants, 2);
  assertTrue(Array.isArray(formData.children), 'Children should be an array');
  assertEquals(formData.children.length, 2);
  assertEquals(formData.children[0].order, 1);
  assertEquals(formData.children[1].order, 2);
});

// ============================================================================
// RÉSULTATS FINAUX
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log('\n📊 RÉSULTATS DES TESTS\n');
console.log(`✅ Tests réussis : ${passedTests}`);
console.log(`❌ Tests échoués : ${failedTests}`);
console.log(`📈 Total : ${passedTests + failedTests}`);
console.log(`🎯 Taux de réussite : ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !');
  console.log('\n✨ Le produit Premium est FONCTIONNEL et VALIDÉ !');
} else {
  console.log('\n⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
  process.exit(1);
}

console.log('\n' + '='.repeat(60) + '\n');

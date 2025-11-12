import { test, expect } from '@playwright/test';
import { ProfessionMapper } from '../../src/products/premium/professionMapper.js';

test.describe('ProfessionMapper', () => {
  test.describe('Exact matches', () => {
    const exactCases = [
      { input: 'Salarié', expected: 'Salarie', confidence: 'exact' },
      { input: 'Salarie', expected: 'Salarie', confidence: 'exact' },
      { input: 'Retraité', expected: 'Retraite', confidence: 'exact' },
      { input: 'Artisan', expected: 'Artisan', confidence: 'exact' },
      { input: 'Consultant', expected: 'Consultant', confidence: 'exact' },
    ];

    for (const { input, expected, confidence } of exactCases) {
      test(`should map "${input}" exactly to "${expected}"`, () => {
        const result = ProfessionMapper.map(input);

        expect(result.formValue).toBe(expected);
        expect(result.confidence).toBe(confidence);
        expect(ProfessionMapper.validateMapping(result)).toBe(true);
      });
    }
  });

  test.describe('Intelligent mappings', () => {
    const mappingCases = [
      { input: 'Profession libérale', expected: 'Consultant' },
      { input: 'Profession liberale', expected: 'Consultant' },
      { input: 'TNS : régime des indépendants', expected: 'Independant' },
      { input: 'TNS : regime des independants', expected: 'Independant' },
      { input: 'Chef d\'entreprise', expected: 'Independant' },
      { input: 'Auto-entrepreneur', expected: 'Independant' },
      { input: 'Freelance', expected: 'Consultant' },
      { input: 'Médecin', expected: 'Consultant' },
      { input: 'Avocat', expected: 'Consultant' },
      { input: 'Infirmier', expected: 'Salarie' },
      { input: 'Ingénieur', expected: 'Salarie' },
    ];

    for (const { input, expected } of mappingCases) {
      test(`should map "${input}" to "${expected}"`, () => {
        const result = ProfessionMapper.map(input);

        expect(result.formValue).toBe(expected);
        expect(result.confidence).toBe('mapped');
        expect(ProfessionMapper.validateMapping(result)).toBe(true);
      });
    }
  });

  test.describe('Fuzzy matching', () => {
    const fuzzyCases = [
      { input: 'travail libéral', expected: 'Consultant' },
      { input: 'tns indépendant', expected: 'Independant' },
      { input: 'employé salarié', expected: 'Salarie' },
      { input: 'retraite pension', expected: 'Retraite' },
    ];

    for (const { input, expected } of fuzzyCases) {
      test(`should fuzzy match "${input}" to "${expected}"`, () => {
        const result = ProfessionMapper.map(input);

        expect(result.formValue).toBe(expected);
        expect(['mapped', 'fallback']).toContain(result.confidence);
      });
    }
  });

  test.describe('Fallback cases', () => {
    const fallbackCases = [
      'Non renseigné',
      'Non renseigne',
      '',
      'Autre',
      'xyz123abc',
      'profession inconnue'
    ];

    for (const input of fallbackCases) {
      test(`should fallback "${input}" to "Autre"`, () => {
        const result = ProfessionMapper.map(input);

        expect(result.formValue).toBe('Autre');
        expect(result.confidence).toBe('fallback');
        expect(ProfessionMapper.validateMapping(result)).toBe(true);
      });
    }
  });

  test('should return available options', () => {
    const options = ProfessionMapper.getAvailableOptions();

    expect(options).toContain('Consultant');
    expect(options).toContain('Independant');
    expect(options).toContain('Artisan');
    expect(options).toContain('Salarie');
    expect(options).toContain('Retraite');
    expect(options).toContain('Autre');
    expect(options.length).toBeGreaterThanOrEqual(10);
  });

  test('should calculate mapping statistics', () => {
    const professions = [
      'Salarié', // exact
      'Profession libérale', // mapped
      'TNS : régime des indépendants', // mapped
      'Non renseigné', // fallback
      'Retraité', // exact
      'xyz123', // fallback
    ];

    const stats = ProfessionMapper.getMappingStats(professions);

    expect(stats.total).toBe(6);
    expect(stats.exact).toBe(2);
    expect(stats.mapped).toBe(2);
    expect(stats.fallback).toBe(2);
  });
});

import { test, expect } from '@playwright/test';
import { ValidationAdapter } from '../../src/products/premium/validationAdapter.js';
import type { PremiumFormData } from '../../src/products/premium/types.js';

function createBasicFormData(): PremiumFormData {
  return {
    civilite: 'M.',
    nom: 'TEST',
    prenom: 'User',
    dateNaissance: '1990-01-01',
    email: 'test@example.com',
    telephone: '06.12.34.56.78',
    adresse: '123 rue Test',
    codePostal: '75001',
    ville: 'Paris',
    profession: 'Salarie',
    regimeSocial: 'Général',
    nombreEnfants: 0,
    dateEffet: '2025-12-31',
    actuellementAssure: false,
    soinsMedicaux: 2,
    hospitalisation: 2,
    optique: 2,
    dentaire: 2,
    numeroSecuriteSociale: '199010100123456',
    mutuelleActuelle: 'Aucune',
    antecedentsMedicaux: false,
  };
}

test.describe('ValidationAdapter', () => {
  test.describe('Date d\'effet validation', () => {
    test('should pass for date +7 days in future', () => {
      const adapter = new ValidationAdapter();
      const today = new Date();
      const validDate = new Date(today);
      validDate.setDate(validDate.getDate() + 7);

      const formData = createBasicFormData();
      formData.dateEffet = validDate.toISOString().split('T')[0];

      const result = adapter.validate(formData);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('should fail for date moins than +7 days', () => {
      const adapter = new ValidationAdapter();
      const today = new Date();
      const invalidDate = new Date(today);
      invalidDate.setDate(invalidDate.getDate() + 3); // Seulement +3 jours

      const formData = createBasicFormData();
      formData.dateEffet = invalidDate.toISOString().split('T')[0];

      const result = adapter.validate(formData);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'dateEffet')).toBe(true);
    });

    test('should auto-adjust date to +7 days minimum', () => {
      const adapter = new ValidationAdapter();
      const today = new Date();
      const invalidDate = new Date(today);
      invalidDate.setDate(invalidDate.getDate() + 1); // +1 jour seulement

      const formData = createBasicFormData();
      formData.dateEffet = invalidDate.toISOString().split('T')[0];

      const { adapted, warnings } = adapter.adapt(formData);

      const adaptedDate = new Date(adapted.dateEffet);
      const minDate = new Date(today);
      minDate.setDate(minDate.getDate() + 7);

      expect(adaptedDate >= minDate).toBe(true);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some(w => w.includes('dateEffet'))).toBe(true);
    });
  });

  test.describe('Date de naissance validation', () => {
    test('should pass for age >= 18', () => {
      const adapter = new ValidationAdapter();
      const today = new Date();
      const validBirthDate = new Date(today);
      validBirthDate.setFullYear(validBirthDate.getFullYear() - 25); // 25 ans

      const formData = createBasicFormData();
      formData.dateNaissance = validBirthDate.toISOString().split('T')[0];

      const result = adapter.validate(formData);

      expect(result.valid).toBe(true);
    });

    test('should fail for age < 18', () => {
      const adapter = new ValidationAdapter();
      const today = new Date();
      const invalidBirthDate = new Date(today);
      invalidBirthDate.setFullYear(invalidBirthDate.getFullYear() - 16); // 16 ans

      const formData = createBasicFormData();
      formData.dateNaissance = invalidBirthDate.toISOString().split('T')[0];

      const result = adapter.validate(formData);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'dateNaissance')).toBe(true);
    });

    test('should auto-adjust age to 18 minimum', () => {
      const adapter = new ValidationAdapter();
      const today = new Date();
      const invalidBirthDate = new Date(today);
      invalidBirthDate.setFullYear(invalidBirthDate.getFullYear() - 15); // 15 ans

      const formData = createBasicFormData();
      formData.dateNaissance = invalidBirthDate.toISOString().split('T')[0];

      const { adapted, warnings } = adapter.adapt(formData);

      const adaptedDate = new Date(adapted.dateNaissance);
      const minDate = new Date(today);
      minDate.setFullYear(minDate.getFullYear() - 18);

      expect(adaptedDate <= minDate).toBe(true);
      expect(warnings.length).toBeGreaterThan(0);
    });
  });

  test.describe('Telephone validation', () => {
    test('should pass for valid format 06.XX.XX.XX.XX', () => {
      const adapter = new ValidationAdapter();
      const formData = createBasicFormData();
      formData.telephone = '06.12.34.56.78';

      const result = adapter.validate(formData);

      expect(result.valid).toBe(true);
    });

    test('should pass for valid format 07.XX.XX.XX.XX', () => {
      const adapter = new ValidationAdapter();
      const formData = createBasicFormData();
      formData.telephone = '07.98.76.54.32';

      const result = adapter.validate(formData);

      expect(result.valid).toBe(true);
    });

    test('should fail for invalid format', () => {
      const adapter = new ValidationAdapter();
      const formData = createBasicFormData();
      formData.telephone = '0612345678'; // Sans points

      const result = adapter.validate(formData);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'telephone')).toBe(true);
    });

    test('should auto-format telephone', () => {
      const adapter = new ValidationAdapter();
      const formData = createBasicFormData();
      formData.telephone = '0612345678'; // Sans points

      const { adapted } = adapter.adapt(formData);

      expect(adapted.telephone).toBe('06.12.34.56.78');
    });

    test('should force 06 prefix if not 06/07', () => {
      const adapter = new ValidationAdapter();
      const formData = createBasicFormData();
      formData.telephone = '0512345678'; // Commence par 05

      const { adapted } = adapter.adapt(formData);

      expect(adapted.telephone.startsWith('06')).toBe(true);
    });
  });

  test.describe('Code postal validation', () => {
    test('should pass for valid 5-digit code', () => {
      const adapter = new ValidationAdapter();
      const formData = createBasicFormData();
      formData.codePostal = '75001';

      const result = adapter.validate(formData);

      expect(result.valid).toBe(true);
    });

    test('should fail for invalid code', () => {
      const adapter = new ValidationAdapter();
      const formData = createBasicFormData();
      formData.codePostal = '123'; // Trop court

      const result = adapter.validate(formData);

      expect(result.valid).toBe(false);
    });

    test('should auto-format code postal', () => {
      const adapter = new ValidationAdapter();
      const formData = createBasicFormData();
      formData.codePostal = '123'; // Trop court

      const { adapted } = adapter.adapt(formData);

      expect(adapted.codePostal).toBe('00123'); // Padded
    });
  });

  test.describe('Complete adaptation', () => {
    test('should adapt multiple fields at once', () => {
      const adapter = new ValidationAdapter();
      const today = new Date();

      const formData = createBasicFormData();
      formData.dateEffet = today.toISOString().split('T')[0]; // Aujourd'hui (invalide)
      formData.dateNaissance = new Date(today.getFullYear() - 15, 0, 1).toISOString().split('T')[0]; // 15 ans
      formData.telephone = '0612345678'; // Sans points
      formData.codePostal = '123'; // Trop court

      const { adapted, warnings } = adapter.adapt(formData);

      // Toutes les adaptations devraient être appliquées
      expect(warnings.length).toBeGreaterThan(0);
      expect(adapted.telephone).toBe('06.12.34.56.78');
      expect(adapted.codePostal).toBe('00123');

      // Les dates devraient être ajustées
      const adaptedDateEffet = new Date(adapted.dateEffet);
      const minDateEffet = new Date(today);
      minDateEffet.setDate(minDateEffet.getDate() + 7);
      expect(adaptedDateEffet >= minDateEffet).toBe(true);
    });
  });
});

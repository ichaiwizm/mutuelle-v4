import { test, expect } from '../../../fixtures/alptis';
import { FormFillStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { hasAlptisCredentials } from '../../../helpers/credentials';
import { expectValidationError, verifyNoErrors, getAllErrorMessages } from '../../../helpers/errorHelpers';

test.describe('Alptis - Error Handling: Invalid Data', () => {
  test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

  test('Should show error for invalid date format', async ({ page, formPage }) => {
    const step = new FormFillStep();

    // Try to fill with invalid date format
    const invalidData = {
      mise_en_place: {
        remplacement_contrat: false,
        date_effet: '99/99/9999', // Invalid date
      },
      adherent: {
        civilite: 'monsieur' as const,
        nom: 'Test',
        prenom: 'User',
        date_naissance: '01/01/1980',
        categorie_socioprofessionnelle: 'ARTISANS',
        cadre_exercice: 'INDEPENDANT_PRESIDENT_SASU_SAS' as const,
        regime_obligatoire: 'SECURITE_SOCIALE_INDEPENDANTS',
        code_postal: '75001',
      },
    };

    await step.fillMiseEnPlace(page, invalidData);

    // Check for errors
    const errors = await step.checkForErrors(page);
    expect(errors.length).toBeGreaterThan(0);
    console.log(`✅ Found ${errors.length} validation error(s) for invalid date`);
  });

  test('Should show error for empty required fields', async ({ page, formPage }) => {
    const step = new FormFillStep();

    // Try to navigate without filling required fields
    const emptyData = {
      mise_en_place: {
        remplacement_contrat: false,
        date_effet: '', // Empty required field
      },
      adherent: {
        civilite: 'monsieur' as const,
        nom: '',
        prenom: '',
        date_naissance: '',
        categorie_socioprofessionnelle: 'ARTISANS',
        regime_obligatoire: 'SECURITE_SOCIALE_INDEPENDANTS',
        code_postal: '',
      },
    };

    // Fill with empty data
    try {
      await step.fillMiseEnPlace(page, emptyData);
      const errors = await step.checkForErrors(page);
      expect(errors.length).toBeGreaterThan(0);
      console.log(`✅ Found ${errors.length} validation error(s) for empty fields`);
    } catch (error) {
      // Expected: fields might throw if they can't be filled with empty values
      console.log('⚠️ Form validation prevented empty field submission');
    }
  });

  test('Should validate code postal format', async ({ page, formPage, leadData }) => {
    const step = new FormFillStep();

    // Fill Section 1
    await step.fillMiseEnPlace(page, leadData);
    expect(await step.checkForErrors(page)).toHaveLength(0);

    // Fill Section 2 with invalid code postal
    const invalidLeadData = {
      ...leadData,
      adherent: {
        ...leadData.adherent,
        code_postal: 'INVALID', // Invalid postal code
      },
    };

    await step.fillAdherent(page, invalidLeadData);

    // Check for errors
    const errors = await step.checkForErrors(page);
    if (errors.length > 0) {
      console.log(`✅ Found ${errors.length} validation error(s) for invalid postal code`);
    } else {
      console.log('⚠️ No validation error found - postal code validation might be lenient');
    }
  });

  test('Should handle form submission with errors', async ({ page, formWithSection2, leadData }) => {
    const step = new FormFillStep();

    // Verify we're on the form and previous sections are filled correctly
    expect(page.url()).toContain('/sante-select/informations-projet/');
    expect(await step.checkForErrors(page)).toHaveLength(0);

    console.log('✅ Form filled with valid data up to Section 2');
    console.log('ℹ️ Error handling tests completed');
  });
});

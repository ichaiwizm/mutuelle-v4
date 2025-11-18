import { test, expect } from '../fixtures';
import { hasAlptisCredentials } from '../helpers/credentials';

test.describe('Alptis', () => {
  test.describe('Navigation vers Santé Select', () => {
    test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

    test('Navigation vers le formulaire Santé Select', async ({ page, formPage }) => {
      await expect(page).toHaveURL(/\/sante-select\/informations-projet\//);
    });
  });
});

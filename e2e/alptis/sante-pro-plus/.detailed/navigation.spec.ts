import { santeProPlusTest as test, expect } from '../../fixtures';
import { hasAlptisCredentials } from '../../helpers/credentials';

test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

test('Navigation vers le formulaire Santé Pro Plus', async ({ page, formPage }) => {
  await expect(page).toHaveURL(/\/sante-pro-plus\/informations-projet\//);
});

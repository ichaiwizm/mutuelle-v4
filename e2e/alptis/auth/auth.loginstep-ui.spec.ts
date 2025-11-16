import { test, expect } from '@playwright/test';
import { LoginStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/login';
import { getAlptisCredentials, hasAlptisCredentials } from '../../helpers/credentials';

test.describe('Alptis - LoginStep UI', () => {
  test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

  test('Affiche les champs username/password sur la page de login', async ({ page }) => {
    const credentials = getAlptisCredentials();
    const loginStep = new LoginStep(credentials);
    await loginStep.execute(page);
    await expect(page).toHaveURL(/alptis\.org/);
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });
});



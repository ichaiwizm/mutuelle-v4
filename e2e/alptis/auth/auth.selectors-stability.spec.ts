import { test, expect } from '@playwright/test';
import { LoginStep } from '@/main/flows/platforms/alptis/products/sante-select/steps/login';
import { getAlptisCredentials, hasAlptisCredentials } from '../../helpers/credentials';

test.describe('Alptis - Login selectors stability', () => {
  test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

  test('Sélecteurs username/password stables', async ({ page }) => {
    const loginStep = new LoginStep(getAlptisCredentials());
    await loginStep.execute(page);
    expect(await page.locator('#username').count()).toBe(1);
    expect(await page.locator('#password').count()).toBe(1);
  });
});



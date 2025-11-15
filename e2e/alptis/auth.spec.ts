import { test, expect } from '@playwright/test';
import { LoginStep } from '../../src/main/flows/platforms/alptis/products/sante-select/steps/login';
import { getAlptisCredentials, hasAlptisCredentials } from '../helpers/credentials';

/**
 * Tests de la LoginStep Alptis
 *
 * Ce test importe et utilise directement la classe LoginStep
 * depuis src/main/flows/ sans réécrire la logique.
 */

test.describe('Alptis - Authentification', () => {
  // Skip tous les tests de cette suite si pas de credentials
  test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

  test('LoginStep - Doit naviguer vers la page de login et afficher les champs', async ({ page }) => {
    // 1. Récupérer les credentials de test
    const credentials = getAlptisCredentials();

    // 2. Créer une instance de LoginStep avec vos credentials
    const loginStep = new LoginStep(credentials);

    // 3. Exécuter l'étape (appelle votre code existant)
    await loginStep.execute(page);

    // 4. Vérifications - la page doit être sur le login Alptis
    await expect(page).toHaveURL(/alptis\.org/);

    // 5. Les champs username et password doivent être visibles
    const usernameField = page.locator('#username');
    const passwordField = page.locator('#password');

    await expect(usernameField).toBeVisible();
    await expect(passwordField).toBeVisible();

    // Note: On ne teste pas la connexion complète ici,
    // juste que la navigation et la détection des champs fonctionnent
  });

  test('LoginStep - Les sélecteurs doivent être stables', async ({ page }) => {
    const credentials = getAlptisCredentials();
    const loginStep = new LoginStep(credentials);

    await loginStep.execute(page);

    // Vérifier que les sélecteurs documentés dans ALPTIS_LOGIN_SELECTORS
    // sont toujours valides
    const usernameSelector = '#username';
    const passwordSelector = '#password';

    const usernameExists = await page.locator(usernameSelector).count();
    const passwordExists = await page.locator(passwordSelector).count();

    expect(usernameExists).toBe(1);
    expect(passwordExists).toBe(1);
  });
});

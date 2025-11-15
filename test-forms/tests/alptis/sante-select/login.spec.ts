import { test, expect } from '@playwright/test';
import { LoginStep } from '../../../src/platforms/alptis/products/sante-select/steps/login';

test.describe('Alptis Santé Select - Login Step', () => {
  test('devrait pouvoir accéder à la page de connexion et vérifier que les champs sont accessibles', async ({ page }) => {
    // Récupérer les credentials depuis les variables d'environnement
    const username = process.env.ALPTIS_USERNAME || '';
    const password = process.env.ALPTIS_PASSWORD || '';

    // Créer l'instance du LoginStep
    const loginStep = new LoginStep({
      username,
      password,
    });

    // Exécuter l'étape de login
    await loginStep.execute(page);

    // Vérifications supplémentaires pour s'assurer que les champs sont bien visibles
    const usernameField = page.locator('#username');
    const passwordField = page.locator('#password');

    await expect(usernameField).toBeVisible();
    await expect(passwordField).toBeVisible();
  });
});

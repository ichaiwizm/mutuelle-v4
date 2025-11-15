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
    console.log('📋 Début du test LoginStep');

    // 1. Récupérer les credentials de test
    const credentials = getAlptisCredentials();
    console.log('✅ Credentials chargés:', credentials.username);

    // 2. Créer une instance de LoginStep avec vos credentials
    const loginStep = new LoginStep(credentials);
    console.log('✅ LoginStep créée');

    // 3. Exécuter l'étape (appelle votre code existant)
    console.log('🚀 Exécution de loginStep.execute()...');
    await loginStep.execute(page);
    console.log('✅ loginStep.execute() terminée');

    // 4. Vérifications - la page doit être sur le login Alptis
    const currentUrl = page.url();
    console.log('🔍 URL actuelle:', currentUrl);
    await expect(page).toHaveURL(/alptis\.org/);
    console.log('✅ URL vérifiée');

    // 5. Les champs username et password doivent être visibles
    console.log('🔍 Recherche du champ #username...');
    const usernameField = page.locator('#username');
    await expect(usernameField).toBeVisible();
    console.log('✅ Champ username visible');

    console.log('🔍 Recherche du champ #password...');
    const passwordField = page.locator('#password');
    await expect(passwordField).toBeVisible();
    console.log('✅ Champ password visible');

    console.log('🎉 Test terminé avec succès');
  });

  test('LoginStep - Les sélecteurs doivent être stables', async ({ page }) => {
    console.log('📋 Début du test des sélecteurs');

    const credentials = getAlptisCredentials();
    const loginStep = new LoginStep(credentials);

    console.log('🚀 Exécution de loginStep.execute()...');
    await loginStep.execute(page);
    console.log('✅ loginStep.execute() terminée');

    // Vérifier que les sélecteurs documentés dans ALPTIS_LOGIN_SELECTORS
    // sont toujours valides
    const usernameSelector = '#username';
    const passwordSelector = '#password';

    console.log('🔍 Comptage des éléments avec sélecteur:', usernameSelector);
    const usernameExists = await page.locator(usernameSelector).count();
    console.log('   Trouvé:', usernameExists, 'élément(s)');

    console.log('🔍 Comptage des éléments avec sélecteur:', passwordSelector);
    const passwordExists = await page.locator(passwordSelector).count();
    console.log('   Trouvé:', passwordExists, 'élément(s)');

    expect(usernameExists).toBe(1);
    expect(passwordExists).toBe(1);

    console.log('🎉 Test des sélecteurs terminé avec succès');
  });

  test('AlptisAuth - Doit remplir les credentials', async ({ page }) => {
    console.log('📋 Début du test de remplissage des credentials');

    const credentials = getAlptisCredentials();
    console.log('✅ Credentials chargés:', credentials.username);

    // Importer AlptisAuth directement
    const { AlptisAuth } = await import('../../src/main/flows/platforms/alptis/lib/AlptisAuth');
    const auth = new AlptisAuth(credentials);
    console.log('✅ AlptisAuth créée');

    // Effectuer la connexion (navigation + remplissage)
    console.log('🚀 Exécution de auth.login()...');
    await auth.login(page);
    console.log('✅ auth.login() terminée');

    // Vérifier que les champs sont remplis avec les bonnes valeurs
    console.log('🔍 Vérification que le champ username est rempli...');
    const usernameValue = await page.inputValue('#username');
    console.log('   Valeur username:', usernameValue);
    expect(usernameValue).toBe(credentials.username);
    console.log('✅ Username correctement rempli');

    console.log('🔍 Vérification que le champ password est rempli...');
    const passwordValue = await page.inputValue('#password');
    console.log('   Valeur password:', '***' + passwordValue.slice(-4));
    expect(passwordValue).toBe(credentials.password);
    console.log('✅ Password correctement rempli');

    console.log('🎉 Test de remplissage des credentials terminé avec succès');
  });
});

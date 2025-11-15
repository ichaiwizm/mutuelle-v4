import { test, expect } from '@playwright/test';

test('Vérifier la page de connexion Alptis', async ({ page }) => {
  // 1. Aller sur la page
  await page.goto('https://pro.alptis.org/');

  // 2. Attendre le chargement
  await page.waitForLoadState('domcontentloaded');

  // 3. Afficher l'URL et le titre
  console.log('URL:', page.url());
  console.log('Titre:', await page.title());

  // 4. Capture d'écran
  await page.screenshot({ path: 'alptis-login.png', fullPage: true });

  // 5. Test simple
  expect(page.url()).toContain('alptis.org');
});

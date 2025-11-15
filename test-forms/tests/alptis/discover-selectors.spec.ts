import { test } from '@playwright/test';

/**
 * Test de découverte des sélecteurs de la page de login Alptis
 * Ce test va sur la page et affiche tous les champs input pour identifier les bons sélecteurs
 */
test('Découvrir les sélecteurs de la page de login Alptis', async ({ page }) => {
  // Aller sur la page Alptis (redirige vers login)
  await page.goto('https://pro.alptis.org/');

  // Attendre que la page soit chargée
  await page.waitForLoadState('networkidle');

  // Prendre un screenshot pour voir la page
  await page.screenshot({ path: 'test-results/alptis-login-page.png', fullPage: true });

  console.log('=== URL actuelle ===');
  console.log(page.url());

  console.log('\n=== TITRE DE LA PAGE ===');
  console.log(await page.title());

  console.log('\n=== TOUS LES CHAMPS INPUT ===');
  const inputs = await page.locator('input').all();
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const type = await input.getAttribute('type');
    const name = await input.getAttribute('name');
    const id = await input.getAttribute('id');
    const placeholder = await input.getAttribute('placeholder');
    const className = await input.getAttribute('class');
    const isVisible = await input.isVisible();

    console.log(`\nInput ${i + 1}:`);
    console.log(`  Type: ${type}`);
    console.log(`  Name: ${name}`);
    console.log(`  ID: ${id}`);
    console.log(`  Placeholder: ${placeholder}`);
    console.log(`  Class: ${className}`);
    console.log(`  Visible: ${isVisible}`);
  }

  console.log('\n=== TOUS LES BOUTONS ===');
  const buttons = await page.locator('button').all();
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const type = await button.getAttribute('type');
    const text = await button.textContent();
    const className = await button.getAttribute('class');
    const isVisible = await button.isVisible();

    console.log(`\nButton ${i + 1}:`);
    console.log(`  Type: ${type}`);
    console.log(`  Text: ${text?.trim()}`);
    console.log(`  Class: ${className}`);
    console.log(`  Visible: ${isVisible}`);
  }

  // Attendre 5 secondes pour pouvoir inspecter la page manuellement si lancé en mode headed
  await page.waitForTimeout(5000);
});

/**
 * Exploration de la page Garanties Alptis
 *
 * Objectif: Comprendre les options de personnalisation des garanties
 * avant la soumission du devis.
 *
 * Usage:
 *   LEAD_INDEX=0 npx playwright test e2e/alptis/sante-select/.detailed/explore-garanties-page.spec.ts --headed
 */
import { test, expect } from '../../fixtures';
import { FormFillOrchestrator } from '@/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { hasAlptisCredentials } from '../../helpers/credentials';

test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

test.setTimeout(120000);

test('Explorer la page Garanties', async ({ page, authenticatedPage, leadData }) => {
  console.log('\n📊 Lead composition:');
  console.log(`   - Conjoint: ${leadData.conjoint ? '✓' : '✗'}`);
  console.log(`   - Enfants: ${leadData.enfants?.length || 0}`);

  // Navigation vers le formulaire
  console.log('\n🧭 Navigation vers le formulaire...');
  await page.goto('https://pro.alptis.org/sante-select/informations-projet/', { waitUntil: 'networkidle' });

  const step = new FormFillOrchestrator();

  // Remplir le formulaire
  console.log('\n📝 Remplissage du formulaire...');
  await step.fillMiseEnPlace(page, leadData);
  await step.fillAdherent(page, leadData);

  if (leadData.conjoint) {
    await step.fillConjointToggle(page, true);
    await step.fillConjoint(page, leadData.conjoint);
  } else {
    await step.fillConjointToggle(page, false);
  }

  if (leadData.enfants && leadData.enfants.length > 0) {
    await step.fillEnfantsToggle(page, true);
    await step.fillEnfants(page, leadData.enfants);
  } else {
    await step.fillEnfantsToggle(page, false);
  }

  // Navigate to Garanties page (but don't save yet)
  console.log('\n🚀 Navigation vers page Garanties...');
  await step.submit(page);
  await expect(page).toHaveURL(/\/sante-select\/garanties/);

  // ============================================================================
  // EXPLORATION DE LA PAGE GARANTIES
  // ============================================================================
  console.log('\n🔍 ===== EXPLORATION DE LA PAGE GARANTIES =====\n');

  // Attendre que la page se charge
  await page.waitForTimeout(2000);

  // Screenshot de la page Garanties AVANT modification
  await page.screenshot({
    path: 'e2e/test-results/alptis-garanties-page-default.png',
    fullPage: true
  });
  console.log('📸 Screenshot: e2e/test-results/alptis-garanties-page-default.png');

  // Explorer les sliders/sélecteurs de niveau
  console.log('\n🎚️ Recherche des SLIDERS/SELECTORS de niveau...');
  const sliderPatterns = [
    'input[type="range"]',
    '.slider', '.range-slider', '.level-slider',
    '[class*="slider"]', '[class*="range"]',
    '.niveau', '[class*="niveau"]',
    'select', '.select', '[class*="select"]',
  ];

  for (const pattern of sliderPatterns) {
    try {
      const elements = page.locator(pattern);
      const count = await elements.count();
      if (count > 0) {
        console.log(`   ✓ ${pattern}: ${count} élément(s)`);
        for (let i = 0; i < Math.min(count, 5); i++) {
          const el = elements.nth(i);
          const tagName = await el.evaluate(e => e.tagName.toLowerCase());
          const className = await el.getAttribute('class');
          const value = await el.inputValue().catch(() => null);
          console.log(`      [${i}] <${tagName}> class="${className}" value="${value}"`);
        }
      }
    } catch {
      // Ignorer
    }
  }

  // Explorer les boutons radio pour les niveaux
  console.log('\n🔘 Recherche des RADIO BUTTONS...');
  const radioInputs = page.locator('input[type="radio"]');
  const radioCount = await radioInputs.count();
  console.log(`   Trouvé ${radioCount} radio buttons`);

  for (let i = 0; i < Math.min(radioCount, 10); i++) {
    const radio = radioInputs.nth(i);
    const name = await radio.getAttribute('name');
    const value = await radio.getAttribute('value');
    const checked = await radio.isChecked();
    const id = await radio.getAttribute('id');
    console.log(`   [${i}] name="${name}" value="${value}" checked=${checked} id="${id}"`);
  }

  // Explorer les checkboxes
  console.log('\n☑️ Recherche des CHECKBOXES...');
  const checkboxes = page.locator('input[type="checkbox"]');
  const checkboxCount = await checkboxes.count();
  console.log(`   Trouvé ${checkboxCount} checkboxes`);

  // Explorer les tableaux de garanties
  console.log('\n📊 Recherche des TABLEAUX de garanties...');
  const tables = page.locator('table');
  const tableCount = await tables.count();
  console.log(`   Trouvé ${tableCount} tableaux`);

  if (tableCount > 0) {
    for (let i = 0; i < tableCount; i++) {
      const table = tables.nth(i);
      const headers = await table.locator('th').allTextContents();
      console.log(`   Table ${i} headers: ${headers.slice(0, 5).join(', ')}`);
    }
  }

  // Explorer les sections de garanties
  console.log('\n📋 Recherche des SECTIONS de garanties...');
  const sectionPatterns = [
    '.garantie', '[class*="garantie"]',
    '.coverage', '[class*="coverage"]',
    '.option', '[class*="option"]',
    'section', '.section',
  ];

  for (const pattern of sectionPatterns) {
    try {
      const elements = page.locator(pattern);
      const count = await elements.count();
      if (count > 0) {
        console.log(`   ✓ ${pattern}: ${count} élément(s)`);
      }
    } catch {
      // Ignorer
    }
  }

  // Explorer les labels/titres des niveaux
  console.log('\n🏷️ Recherche des LABELS de niveaux...');
  const levelKeywords = ['niveau', 'level', 'formule', 'option', 'base', 'confort', 'premium', 'essentiel'];

  for (const keyword of levelKeywords) {
    const elements = page.locator(`text=${keyword}`);
    const count = await elements.count();
    if (count > 0) {
      console.log(`   "${keyword}": ${count} élément(s)`);
      for (let i = 0; i < Math.min(count, 3); i++) {
        const text = await elements.nth(i).textContent();
        console.log(`      [${i}] ${text?.trim().substring(0, 60)}`);
      }
    }
  }

  // Explorer les boutons sur la page
  console.log('\n🔲 Recherche des BOUTONS...');
  const buttons = page.locator('button');
  const buttonCount = await buttons.count();
  console.log(`   Trouvé ${buttonCount} boutons`);

  for (let i = 0; i < Math.min(buttonCount, 10); i++) {
    const btn = buttons.nth(i);
    const text = await btn.textContent();
    const className = await btn.getAttribute('class');
    if (text?.trim()) {
      console.log(`   [${i}] "${text.trim().substring(0, 40)}" class="${className?.substring(0, 50)}"`);
    }
  }

  // Scroll et screenshot de la page entière
  console.log('\n📜 Scrolling pour voir toute la page...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);

  await page.screenshot({
    path: 'e2e/test-results/alptis-garanties-page-bottom.png',
    fullPage: true
  });
  console.log('📸 Screenshot (bottom): e2e/test-results/alptis-garanties-page-bottom.png');

  console.log('\n✅ Exploration terminée!');
  console.log('   Consulte les screenshots pour voir les options de personnalisation.');

  // Pause pour inspection manuelle
  console.log('\n⏸️  Page laissée ouverte pour inspection manuelle (20s)...');
  await page.waitForTimeout(20000);
});

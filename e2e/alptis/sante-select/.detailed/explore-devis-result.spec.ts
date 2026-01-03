/**
 * Exploration de la page résultat Alptis après confirmSave()
 *
 * Objectif: Identifier les sélecteurs CSS pour extraire les données de devis:
 * - Prix mensuel
 * - Nom de la formule
 * - URL du devis
 * - Bouton téléchargement PDF (si existe)
 *
 * Usage:
 *   LEAD_INDEX=0 npx playwright test e2e/alptis/sante-select/.detailed/explore-devis-result.spec.ts --headed
 */
import { test, expect } from '../../fixtures';
import { FormFillOrchestrator } from '@/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { hasAlptisCredentials } from '../../helpers/credentials';

test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

// Timeout plus long pour exploration
test.setTimeout(120000);

test('Explorer la page résultat après confirmSave', async ({ page, authenticatedPage, leadData }) => {
  console.log('\n📊 Lead composition:');
  console.log(`   - Conjoint: ${leadData.conjoint ? '✓' : '✗'}`);
  console.log(`   - Enfants: ${leadData.enfants?.length || 0}`);

  // Navigation vers le formulaire
  console.log('\n🧭 Navigation vers le formulaire...');
  await page.goto('https://pro.alptis.org/sante-select/informations-projet/', { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/\/sante-select\/informations-projet/);

  const step = new FormFillOrchestrator();

  // Remplir le formulaire complet
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

  // Submit -> Page Garanties
  console.log('\n🚀 Navigation vers Garanties...');
  await step.submit(page);
  await expect(page).toHaveURL(/\/sante-select\/garanties/);

  // Enregistrer
  console.log('\n💾 Enregistrement...');
  await step.saveGaranties(page);
  await step.confirmSave(page);

  // ============================================================================
  // EXPLORATION DE LA PAGE RÉSULTAT
  // ============================================================================
  console.log('\n🔍 ===== EXPLORATION DE LA PAGE RÉSULTAT =====\n');

  // Attendre que la page se stabilise
  await page.waitForTimeout(2000);

  // Screenshot de la page complète
  await page.screenshot({
    path: 'e2e/test-results/alptis-devis-result-page.png',
    fullPage: true
  });
  console.log('📸 Screenshot: e2e/test-results/alptis-devis-result-page.png');

  // URL actuelle
  const currentUrl = page.url();
  console.log(`\n🔗 URL actuelle: ${currentUrl}`);

  // Explorer les éléments de prix potentiels
  console.log('\n💰 Recherche des éléments de PRIX...');
  const pricePatterns = [
    // Sélecteurs spécifiques
    '.cotisation', '.prix', '.tarif', '.montant', '.premium',
    '.monthly', '.mensuel', '.annuel',
    // Classes génériques avec montants
    '[class*="price"]', '[class*="amount"]', '[class*="cost"]',
    '[class*="cotisation"]', '[class*="tarif"]',
    // Éléments contenant des symboles monétaires
    ':has-text("€")', ':has-text("EUR")',
  ];

  for (const pattern of pricePatterns) {
    try {
      const elements = page.locator(pattern);
      const count = await elements.count();
      if (count > 0) {
        console.log(`   ✓ ${pattern}: ${count} élément(s)`);
        for (let i = 0; i < Math.min(count, 3); i++) {
          const text = await elements.nth(i).textContent();
          if (text && text.includes('€')) {
            console.log(`      [${i}] ${text.trim().substring(0, 100)}`);
          }
        }
      }
    } catch {
      // Ignorer les erreurs de sélecteur
    }
  }

  // Explorer les éléments de formule
  console.log('\n📋 Recherche des éléments de FORMULE...');
  const formulaPatterns = [
    '.formule', '.garantie', '.option', '.niveau', '.pack',
    '[class*="formula"]', '[class*="garantie"]', '[class*="coverage"]',
    ':has-text("Formule")', ':has-text("Garantie")',
  ];

  for (const pattern of formulaPatterns) {
    try {
      const elements = page.locator(pattern);
      const count = await elements.count();
      if (count > 0) {
        console.log(`   ✓ ${pattern}: ${count} élément(s)`);
        for (let i = 0; i < Math.min(count, 3); i++) {
          const text = await elements.nth(i).textContent();
          if (text) {
            console.log(`      [${i}] ${text.trim().substring(0, 80)}`);
          }
        }
      }
    } catch {
      // Ignorer
    }
  }

  // Explorer les boutons/liens PDF
  console.log('\n📄 Recherche des éléments PDF/TÉLÉCHARGEMENT...');
  const pdfPatterns = [
    'a:has-text("PDF")', 'button:has-text("PDF")',
    'a:has-text("Télécharger")', 'button:has-text("Télécharger")',
    'a:has-text("Download")', 'button:has-text("Download")',
    '[href*=".pdf"]', '[download]',
    '.download', '.pdf', '.export',
  ];

  for (const pattern of pdfPatterns) {
    try {
      const elements = page.locator(pattern);
      const count = await elements.count();
      if (count > 0) {
        console.log(`   ✓ ${pattern}: ${count} élément(s)`);
        for (let i = 0; i < Math.min(count, 3); i++) {
          const el = elements.nth(i);
          const text = await el.textContent();
          const href = await el.getAttribute('href');
          console.log(`      [${i}] text="${text?.trim()}" href="${href}"`);
        }
      }
    } catch {
      // Ignorer
    }
  }

  // Explorer les références/numéros de devis
  console.log('\n🔢 Recherche des RÉFÉRENCES de devis...');
  const refPatterns = [
    ':has-text("Référence")', ':has-text("Numéro")', ':has-text("N°")',
    ':has-text("Devis")', ':has-text("Projet")',
    '[class*="reference"]', '[class*="numero"]', '[class*="id"]',
  ];

  for (const pattern of refPatterns) {
    try {
      const elements = page.locator(pattern);
      const count = await elements.count();
      if (count > 0) {
        console.log(`   ✓ ${pattern}: ${count} élément(s)`);
        for (let i = 0; i < Math.min(count, 3); i++) {
          const text = await elements.nth(i).textContent();
          if (text) {
            console.log(`      [${i}] ${text.trim().substring(0, 100)}`);
          }
        }
      }
    } catch {
      // Ignorer
    }
  }

  // Dump du HTML de la section principale
  console.log('\n📝 Structure HTML principale...');
  try {
    const mainContent = await page.locator('main, .main-content, #content, .content').first().innerHTML();
    console.log(`   Longueur du contenu principal: ${mainContent?.length || 0} caractères`);
  } catch {
    console.log('   Pas de conteneur principal trouvé');
  }

  // Liste tous les éléments contenant "€"
  console.log('\n💶 Tous les éléments contenant "€"...');
  const euroElements = page.locator('*:has-text("€")');
  const euroCount = await euroElements.count();
  console.log(`   Trouvé ${euroCount} éléments`);

  // Filtrer pour n'afficher que les éléments feuilles (sans enfants avec €)
  const displayedPrices = new Set<string>();
  for (let i = 0; i < Math.min(euroCount, 20); i++) {
    try {
      const el = euroElements.nth(i);
      const text = await el.textContent();
      const tag = await el.evaluate(e => e.tagName.toLowerCase());
      const className = await el.getAttribute('class');

      if (text && text.includes('€') && !displayedPrices.has(text.trim())) {
        const shortText = text.trim().substring(0, 60);
        if (shortText.match(/\d+[,.]?\d*\s*€/)) {
          console.log(`   <${tag} class="${className}"> ${shortText}`);
          displayedPrices.add(text.trim());
        }
      }
    } catch {
      // Ignorer
    }
  }

  console.log('\n✅ Exploration terminée!');
  console.log('   Consulte le screenshot et les logs pour identifier les sélecteurs.');

  // Pause pour inspection manuelle si en mode headed
  console.log('\n⏸️  Page laissée ouverte pour inspection manuelle...');
  console.log('   Ferme le navigateur pour terminer le test.');

  // Attendre plus longtemps en mode debug pour permettre l'inspection
  await page.waitForTimeout(30000);
});

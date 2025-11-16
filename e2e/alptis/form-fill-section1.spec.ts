import { test, expect } from '@playwright/test';
import { AlptisAuth } from '../../src/main/flows/platforms/alptis/lib/AlptisAuth';
import { NavigationStep } from '../../src/main/flows/platforms/alptis/products/sante-select/steps/navigation';
import { FormFillStep } from '../../src/main/flows/platforms/alptis/products/sante-select/steps/form-fill';
import { LeadTransformer } from '../../src/main/flows/platforms/alptis/products/sante-select/transformers/LeadTransformer';
import { getAlptisCredentials, hasAlptisCredentials } from '../helpers/credentials';
import { loadAllLeads } from '../helpers/loadLeads';
import type { Lead } from '../../src/shared/types/lead';

test.describe('Alptis - Form Fill Section 1', () => {
  test.skip(!hasAlptisCredentials(), 'Credentials manquants dans .env');

  test('Remplir Section 1: Mise en place du contrat - email-001', async ({ page }: { page: any }) => {
    console.log('\n📋 [TEST] Début du test - email-001');
    console.log('='.repeat(60));

    // ==========================================
    // STEP 0: Block Axeptio cookie banner for entire session
    // ==========================================
    console.log('\n🚫 [COOKIES] Blocage du script Axeptio...');
    // Logs réseau ciblés (requêtes/ réponses liées au consentement)
    page.on('request', (req: any) => {
      const url = req.url();
      if (/axept(io)?|consent|cmp|gtm/i.test(url)) {
        console.log(`[NET][REQ] ${req.method()} ${url}`);
      }
    });
    page.on('response', async (res: any) => {
      const url = res.url();
      if (/axept(io)?|consent|cmp|gtm/i.test(url)) {
        console.log(`[NET][RES] ${res.status()} ${url}`);
      }
    });
    page.on('requestfailed', (req: any) => {
      const url = req.url();
      if (/axept(io)?|consent|cmp|gtm/i.test(url)) {
        console.log(`[NET][FAIL] ${req.failure()?.errorText ?? 'unknown'} ${url}`);
      }
    });

    // Interceptions bloquantes (page + context) pour empêcher tout chargement Axeptio
    const ctx = page.context();
    const abortAndLog = async (route: any, tag: string) => {
      const req = route.request();
      console.log(`[COOKIES][ABORT ${tag}] ${req.method()} ${req.url()}`);
      await route.abort();
    };

    // 1) Motifs historiques potentiels (sous-domaines axeptio.*)
    await page.route('**/*axeptio*/**', (route: any) => abortAndLog(route, 'axeptio*'));
    await ctx.route('**/*axeptio*/**', (route: any) => abortAndLog(route, 'ctx:axeptio*'));

    // 2) Domaine réel Axeptio
    await page.route('**/*axept.io/**', (route: any) => abortAndLog(route, 'axept.io'));
    await ctx.route('**/*axept.io/**', (route: any) => abortAndLog(route, 'ctx:axept.io'));
    await page.route('**/*static.axept.io/**', (route: any) => abortAndLog(route, 'static.axept.io'));
    await ctx.route('**/*static.axept.io/**', (route: any) => abortAndLog(route, 'ctx:static.axept.io'));

    // 3) CDN jsDelivr pour package @axeptio/sdk
    await page.route('**/*cdn.jsdelivr.net/**/@axeptio/**', (route: any) => abortAndLog(route, 'jsdelivr:@axeptio'));
    await ctx.route('**/*cdn.jsdelivr.net/**/@axeptio/**', (route: any) => abortAndLog(route, 'ctx:jsdelivr:@axeptio'));

    console.log('✅ [COOKIES] Interceptions bloquantes configurées (page + context)');

    // ==========================================
    // STEP 1: Load test data
    // ==========================================
    console.log('\n📥 [DATA] Chargement du lead...');

    const leads = loadAllLeads();
    const lead = leads[0]; // email-001

    if (!lead) {
      throw new Error('Failed to load lead from email-001');
    }

    console.log('✅ [DATA] Lead chargé');
    console.log(`  ↳ Adhérent: ${lead.subscriber.prenom} ${lead.subscriber.nom}`);
    console.log(`  ↳ Date naissance: ${lead.subscriber.dateNaissance}`);

    // ==========================================
    // STEP 2: Authentication
    // ==========================================
    console.log('\n🔐 [AUTH] Connexion...');

    const credentials = getAlptisCredentials();
    const auth = new AlptisAuth(credentials);

    await auth.login(page);

    console.log('✅ [AUTH] Connecté');
    console.log(`  ↳ URL: ${page.url()}`);

    // Verify we're authenticated
    expect(page.url()).not.toContain('/auth/realms/');

    // ==========================================
    // STEP 3: Navigate to form
    // ==========================================
    console.log('\n🧭 [NAV] Navigation vers formulaire...');

    const navigationStep = new NavigationStep();
    await navigationStep.execute(page);

    console.log('✅ [NAV] Sur le formulaire');
    console.log(`  ↳ URL: ${page.url()}`);

    // ==========================================
    // COOKIES DEBUG: Vérifications sur la page formulaire
    // ==========================================
    console.log('\n🔎 [COOKIES] Diagnostic sur le formulaire...');
    const overlayCount = await page.locator('#axeptio_overlay').count();
    console.log(`[COOKIES] Overlay présent ? ${overlayCount > 0 ? 'Oui' : 'Non'}`);

    const axeptScripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]'))
        .map(s => s.getAttribute('src') || '')
        .filter(u => /axept(io)?/i.test(u));
    });
    console.log(`[COOKIES] Scripts Axeptio détectés: ${axeptScripts.length > 0 ? axeptScripts.join(', ') : 'Aucun'}`);

    const axeptIframes = await page.locator('iframe[src*="axept.io"]').count();
    console.log(`[COOKIES] Iframe axept.io ? ${axeptIframes > 0 ? 'Oui' : 'Non'}`);

    // Verify we're on the form
    expect(page.url()).toContain('/sante-select/informations-projet/');

    // ==========================================
    // STEP 4: Transform lead data
    // ==========================================
    console.log('\n🔄 [TRANSFORM] Transformation du lead...');

    const transformedData = LeadTransformer.transform(lead);

    console.log('✅ [TRANSFORM] Lead transformé');
    console.log('  ↳ Sections:');
    console.log(`     - Mise en place: ${JSON.stringify(transformedData.mise_en_place)}`);
    console.log(`     - Adhérent: ${transformedData.adherent.prenom} ${transformedData.adherent.nom}`);
    if (transformedData.conjoint) {
      console.log('     - Conjoint: Oui');
    }
    if (transformedData.enfants && transformedData.enfants.length > 0) {
      console.log(`     - Enfants: ${transformedData.enfants.length}`);
    }

    // ==========================================
    // STEP 5: Fill Section 1
    // ==========================================
    console.log('\n📝 [FORM-FILL] Remplissage de la section 1...');
    console.log('');

    const formFillStep = new FormFillStep();
    await formFillStep.fillMiseEnPlace(page, transformedData);

    // ==========================================
    // STEP 6: Verify section is filled correctly
    // ==========================================
    console.log('\n🔍 [VERIFY] Vérification de la section...');

    // Check for validation errors
    const errors = await formFillStep.checkForErrors(page);
    expect(errors).toHaveLength(0);
    console.log('✅ [VERIFY] Aucune erreur de validation');

    // Verify remplacement_contrat state
    const remplacementToggle = page.locator("[class*='totem-toggle__input']").first();
    const isRemplacementChecked = await remplacementToggle.isChecked();
    expect(isRemplacementChecked).toBe(transformedData.mise_en_place.remplacement_contrat);
    console.log(`✅ [VERIFY] Remplacement contrat: ${isRemplacementChecked ? 'Oui' : 'Non'}`);

    // Verify demande_resiliation if applicable
    if (transformedData.mise_en_place.remplacement_contrat && transformedData.mise_en_place.demande_resiliation) {
      const radioValue = transformedData.mise_en_place.demande_resiliation;
      const selectedRadio = page.locator(`input[name*='form-radio'][value='${radioValue}']`);
      const isRadioChecked = await selectedRadio.isChecked();
      expect(isRadioChecked).toBe(true);
      console.log(`✅ [VERIFY] Demande résiliation: ${radioValue}`);
    }

    // Verify date_effet
    const dateEffetInput = page.locator("input[placeholder='Ex : 01/01/2020']").first();
    const dateEffetValue = await dateEffetInput.inputValue();
    expect(dateEffetValue).toBe(transformedData.mise_en_place.date_effet);
    console.log(`✅ [VERIFY] Date d'effet: ${dateEffetValue}`);

    // ==========================================
    // STEP 7: Take screenshot
    // ==========================================
    console.log('\n📸 [SCREENSHOT] Capture d\'écran...');

    await page.screenshot({
      path: `./e2e/test-results/section-1-filled-${Date.now()}.png`,
      fullPage: true,
    });

    console.log('✅ [SCREENSHOT] Screenshot sauvegardé');

    // ==========================================
    // TEST COMPLETE
    // ==========================================
    console.log('\n🎉 [TEST] Test terminé avec succès');
    console.log('='.repeat(60));
  });
});

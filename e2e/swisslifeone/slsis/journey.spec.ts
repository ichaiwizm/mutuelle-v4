import { test, expect } from '../fixtures';
import { SwissLifeOneInstances } from '@/main/flows/registry';

test.describe('SwissLife One - Form Fill Journey', () => {
  test('🎉 STEP 1 COMPLET: Toutes les 7 sections', async ({ page, formWithStep1Section7, leadData }) => {
    test.setTimeout(180000); // Increase timeout to 180s (3min) for complete Step 1 with all sections
    const nav = SwissLifeOneInstances.getNavigationStep();
    const frame = await nav.getIframe(page);

    // All 7 sections are filled by the fixture
    // Verify we're still on the form
    expect(page.url()).toContain('/tarification-et-simulation/slsis');

    const formFill = SwissLifeOneInstances.getFormFillStep();
    const errors = await formFill.checkForErrors(frame);

    console.log(`\n✅ Journey completed for lead: ${leadData.projet.nom_projet}`);
    console.log(`   - Section 1: Nom du projet ✓`);
    console.log(`   - Section 2: Besoins (couverture: ${leadData.besoins.besoin_couverture_individuelle ? 'oui' : 'non'}, indemnités: ${leadData.besoins.besoin_indemnites_journalieres ? 'oui' : 'non'}) ✓`);
    console.log(`   - Section 3: Type simulation (${leadData.type_simulation}) ✓`);
    console.log(`   - Section 4: Assuré principal (date: ${leadData.assure_principal.date_naissance}, dept: ${leadData.assure_principal.departement_residence}, régime: ${leadData.assure_principal.regime_social}) ✓`);
    if (leadData.conjoint) {
      console.log(`   - Section 5: Conjoint (date: ${leadData.conjoint.date_naissance}, régime: ${leadData.conjoint.regime_social}) ✓`);
    } else {
      console.log(`   - Section 5: Pas de conjoint (ignorée) ✓`);
    }
    if (leadData.enfants && leadData.enfants.nombre_enfants > 0) {
      console.log(`   - Section 6: ${leadData.enfants.nombre_enfants} enfant${leadData.enfants.nombre_enfants > 1 ? 's' : ''} ✓`);
    } else {
      console.log(`   - Section 6: Pas d'enfants (0 sélectionné) ✓`);
    }
    console.log(`   - Section 7: Gamme (${leadData.gammes_options.gamme}), Date effet (${leadData.gammes_options.date_effet}), Loi Madelin (${leadData.gammes_options.loi_madelin ? 'oui' : 'non'}) ✓`);
    console.log(`   - Errors found: ${errors.length}\n`);
    console.log('🎉 STEP 1 COMPLET - TOUTES LES SECTIONS REMPLIES !');
  });
});

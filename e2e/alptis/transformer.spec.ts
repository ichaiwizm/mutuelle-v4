import { test, expect } from '@playwright/test';
import { LeadTransformer } from '../../src/main/flows/platforms/alptis/products/sante-select/transformers/LeadTransformer';
import { loadAllLeads } from '../helpers/loadLeads';

/**
 * Tests du transformer Alptis Santé Select
 *
 * Ces tests vérifient la transformation complète des leads :
 * - Validation des champs
 * - Mapping des valeurs (civilité, profession, régime)
 * - Transformation des dates
 * - Gestion des sections conditionnelles (conjoint, enfants)
 */

test.describe('Alptis - LeadTransformer', () => {
  test('Transform all leads with detailed verification', () => {
    const leads = loadAllLeads();

    console.log(`\n${'='.repeat(80)}`);
    console.log(`TESTING TRANSFORMER WITH ${leads.length} LEADS`);
    console.log('='.repeat(80));

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ index: number; leadId: string; error: string }> = [];

    leads.forEach((lead, index) => {
      const emailNumber = String(index + 1).padStart(3, '0');

      console.log(`\n${'='.repeat(80)}`);
      console.log(`TEST LEAD #${index + 1}/${leads.length} - email-${emailNumber}`);
      console.log('='.repeat(80));

      console.log('\n📥 INPUT LEAD:');
      console.log('Lead ID:', lead.id);
      console.log('Subscriber:', {
        civilite: lead.subscriber.civilite,
        nom: lead.subscriber.nom,
        prenom: lead.subscriber.prenom,
        dateNaissance: lead.subscriber.dateNaissance,
        profession: lead.subscriber.profession,
        regimeSocial: lead.subscriber.regimeSocial,
        codePostal: lead.subscriber.codePostal,
      });

      if (lead.project) {
        console.log('Project:', {
          dateEffet: lead.project.dateEffet,
          actuellementAssure: lead.project.actuellementAssure,
          hasConjoint: !!lead.project.conjoint,
        });
      }

      if (lead.children) {
        console.log('Children:', lead.children.length, 'child(ren)');
      }

      // Transformer le lead
      let transformed;
      try {
        transformed = LeadTransformer.transform(lead);
        successCount++;
      } catch (error) {
        console.error('\n❌ TRANSFORMATION FAILED:', error);
        errorCount++;
        errors.push({
          index: index + 1,
          leadId: lead.id,
          error: error instanceof Error ? error.message : String(error),
        });
        return; // Skip verification for failed transformation
      }

      console.log('\n📤 OUTPUT (TRANSFORMED):');
      console.log(JSON.stringify(transformed, null, 2));

      // ============================================================
      // VÉRIFICATIONS
      // ============================================================

      console.log('\n✓ VERIFICATION:');

      try {
        // 1. Structure de base
        expect(transformed).toHaveProperty('mise_en_place');
        expect(transformed).toHaveProperty('adherent');
        console.log('  ✓ Base structure OK');

        // 2. Mise en place du contrat
        expect(transformed.mise_en_place).toHaveProperty('remplacement_contrat');
        expect(transformed.mise_en_place).toHaveProperty('date_effet');
        expect(transformed.mise_en_place.date_effet).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
        console.log('  ✓ Mise en place OK');

        // 3. Adhérent
        expect(transformed.adherent.civilite).toMatch(/^(monsieur|madame)$/);
        expect(transformed.adherent.nom).toBe(lead.subscriber.nom);
        expect(transformed.adherent.prenom).toBe(lead.subscriber.prenom);
        expect(transformed.adherent.date_naissance).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
        expect(transformed.adherent.code_postal).toBe(lead.subscriber.codePostal);

        // Profession mappée
        expect(transformed.adherent.categorie_socioprofessionnelle).toMatch(
          /^(AGRICULTEURS_EXPLOITANTS|ARTISANS|CADRES|CADRES_ET_EMPLOYES_DE_LA_FONCTION_PUBLIQUE|CHEFS_D_ENTREPRISE|COMMERCANTS_ET_ASSIMILES|EMPLOYES_AGENTS_DE_MAITRISE|OUVRIERS|PERSONNES_SANS_ACTIVITE_PROFESSIONNELLE|PROFESSIONS_LIBERALES_ET_ASSIMILES|RETRAITES)$/
        );

        // Régime mappé
        expect(transformed.adherent.regime_obligatoire).toMatch(
          /^(ALSACE_MOSELLE|AMEXA|REGIME_SALARIES_AGRICOLES|SECURITE_SOCIALE|SECURITE_SOCIALE_INDEPENDANTS)$/
        );
        console.log('  ✓ Adhérent OK');

        // 4. Conjoint (si présent)
        if (lead.project?.conjoint) {
          expect(transformed).toHaveProperty('conjoint');
          expect(transformed.conjoint).toHaveProperty('date_naissance');
          expect(transformed.conjoint).toHaveProperty('categorie_socioprofessionnelle');
          expect(transformed.conjoint).toHaveProperty('regime_obligatoire');
          expect(transformed.conjoint!.date_naissance).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
          console.log('  ✓ Conjoint OK');
        } else {
          expect(transformed.conjoint).toBeUndefined();
          console.log('  ✓ No conjoint (as expected)');
        }

        // 5. Enfants (si présents)
        if (lead.children && lead.children.length > 0) {
          // Peut être undefined si tous les enfants ont été skippés (> 27 ans)
          if (transformed.enfants) {
            expect(Array.isArray(transformed.enfants)).toBe(true);
            expect(transformed.enfants.length).toBeGreaterThan(0);

            transformed.enfants.forEach((enfant, i) => {
              expect(enfant).toHaveProperty('date_naissance');
              expect(enfant).toHaveProperty('regime_obligatoire');
              expect(enfant.date_naissance).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
              expect(enfant.regime_obligatoire).toBe(transformed.adherent.regime_obligatoire);
            });

            console.log(`  ✓ ${transformed.enfants.length} enfant(s) OK`);
          } else {
            console.log('  ✓ No valid children (all skipped due to age)');
          }
        } else {
          expect(transformed.enfants).toBeUndefined();
          console.log('  ✓ No children (as expected)');
        }

        console.log('\n✅ TRANSFORMATION & VERIFICATION SUCCESSFUL');
      } catch (verificationError) {
        console.error('\n❌ VERIFICATION FAILED:', verificationError);
        errorCount++;
        successCount--; // Remove from success count
        errors.push({
          index: index + 1,
          leadId: lead.id,
          error: `Verification failed: ${verificationError instanceof Error ? verificationError.message : String(verificationError)}`,
        });
      }
    });

    // Final summary
    console.log('\n' + '='.repeat(80));
    console.log('FINAL SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total leads: ${leads.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(({ index, leadId, error }) => {
        console.log(`  - Lead #${index} (${leadId}): ${error}`);
      });
    }

    console.log('=' + '='.repeat(80) + '\n');

    // Expect all transformations to succeed
    expect(errorCount).toBe(0);
    expect(successCount).toBe(leads.length);
  });
});

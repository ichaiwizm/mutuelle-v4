/**
 * Verification helpers for SwissLifeOne transformer tests
 */
import { expect } from '@playwright/test';
import type { SwissLifeOneFormData } from '../../../src/main/flows/platforms/swisslifeone/products/slsis/transformers/types';
import type { Lead } from '../../../src/shared/types/lead';

/**
 * Verify all sections of transformed SwissLifeOne data
 */
export function verifyTransformedData(
  transformed: SwissLifeOneFormData,
  lead: Lead,
  index: number
): void {
  const leadNumber = index + 1;

  console.log(`\n📤 TRANSFORMED DATA - Lead #${leadNumber}:`);
  console.log('Projet:', transformed.projet);
  console.log('Besoins:', transformed.besoins);
  console.log('Type simulation:', transformed.type_simulation);
  console.log('Assuré principal:', {
    dept: transformed.assure_principal.departement_residence,
    regime: transformed.assure_principal.regime_social,
    profession: transformed.assure_principal.profession,
    statut: transformed.assure_principal.statut,
  });

  // ============================================================================
  // VERIFY PROJET
  // ============================================================================
  expect(transformed.projet).toHaveProperty('nom_projet');
  // Format: "Projet {nom} {prenom} {YYYYMMDD}"
  expect(transformed.projet.nom_projet).toMatch(/^Projet .+ .+ \d{8}$/);

  // ============================================================================
  // VERIFY BESOINS (Defaults)
  // ============================================================================
  expect(transformed.besoins.besoin_couverture_individuelle).toBe(true);
  expect(transformed.besoins.besoin_indemnites_journalieres).toBe(false);

  // ============================================================================
  // VERIFY TYPE SIMULATION
  // ============================================================================
  expect(transformed.type_simulation).toMatch(/^(INDIVIDUEL|POUR_LE_COUPLE)$/);

  // ============================================================================
  // VERIFY ASSURE PRINCIPAL
  // ============================================================================
  expect(transformed.assure_principal.date_naissance).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);

  // Département (extrait du codePostal): 01-95, 2A, 2B, 97
  expect(transformed.assure_principal.departement_residence).toMatch(/^(\d{2}|2A|2B|97)$/);

  expect(transformed.assure_principal.regime_social).toBeDefined();
  expect(transformed.assure_principal.profession).toBeDefined();

  // NOUVEAU: Statut professionnel (SALARIE, ETUDIANT, TRANSFRONTALIER, FONCTIONNAIRE)
  expect(transformed.assure_principal.statut).toBeDefined();
  expect(transformed.assure_principal.statut).toMatch(
    /^(SALARIE|ETUDIANT|TRANSFRONTALIER|FONCTIONNAIRE)$/
  );

  // ============================================================================
  // VERIFY CONJOINT (Optional)
  // ============================================================================
  if (transformed.conjoint) {
    console.log('Conjoint: present');
    expect(transformed.conjoint.date_naissance).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(transformed.conjoint.regime_social).toBeDefined();
    expect(transformed.conjoint.profession).toBeDefined();

    // NOUVEAU: Statut aussi pour conjoint
    expect(transformed.conjoint.statut).toBeDefined();
    expect(transformed.conjoint.statut).toMatch(
      /^(SALARIE|ETUDIANT|TRANSFRONTALIER|FONCTIONNAIRE)$/
    );
  } else {
    console.log('Conjoint: absent');
  }

  // ============================================================================
  // VERIFY ENFANTS (Optional)
  // ============================================================================
  if (transformed.enfants) {
    console.log(`Enfants: ${transformed.enfants.nombre_enfants}`);

    // Vérifier que nombre_enfants correspond à la longueur de la liste
    expect(transformed.enfants.nombre_enfants).toBe(transformed.enfants.liste.length);

    transformed.enfants.liste.forEach((enfant, i) => {
      expect(enfant.date_naissance).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);

      // NOUVEAU: Ayant droit (ASSURE_PRINCIPAL ou CONJOINT)
      expect(enfant.ayant_droit).toBeDefined();
      expect(enfant.ayant_droit).toMatch(/^(ASSURE_PRINCIPAL|CONJOINT)$/);

      console.log(`  Enfant #${i + 1}: ${enfant.date_naissance}, ayant_droit: ${enfant.ayant_droit}`);
    });
  } else {
    console.log('Enfants: aucun');
  }

  // ============================================================================
  // VERIFY GAMMES ET OPTIONS
  // ============================================================================
  expect(transformed.gammes_options.gamme).toBeDefined();
  expect(transformed.gammes_options.gamme).toMatch(
    /^(SWISSLIFE_SANTE|SWISSLIFE_SANTE_ADDITIONNELLE|SWISS_SANTE_MA_FORMULE_HOSPITALISATION)$/
  );

  expect(transformed.gammes_options.date_effet).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);

  // NOUVEAU: Loi Madelin (boolean calculé depuis TNS)
  expect(typeof transformed.gammes_options.loi_madelin).toBe('boolean');

  // Defaults
  expect(transformed.gammes_options.reprise_iso_garanties).toBe(true);
  expect(transformed.gammes_options.resiliation_a_effectuer).toBe(false);

  console.log(
    `Gammes: ${transformed.gammes_options.gamme}, Loi Madelin: ${transformed.gammes_options.loi_madelin}`
  );

  console.log(`✅ Lead #${leadNumber} transformed successfully`);
}

import 'dotenv/config';
import { FixtureExporter } from '../src/main/services/fixtureExporter';

async function exportAllFixtures() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  EXPORT DE TOUS LES EMAILS VERS FIXTURES             ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const days = parseInt(process.env.GMAIL_TEST_DAYS || '300', 10);
  console.log(`📅 Export des emails des ${days} derniers jours...\n`);

  try {
    const result = await FixtureExporter.exportEmailsToFixtures(days);

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  RÉSULTATS                                            ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`✅ Emails ajoutés:   ${result.added}`);
    console.log(`⏭️  Emails ignorés:   ${result.skipped}`);
    console.log(`❌ Erreurs:          ${result.errors.length}\n`);

    if (result.errors.length > 0) {
      console.log('Erreurs rencontrées:');
      result.errors.forEach(err => console.log(`  - ${err}`));
      console.log('');
    }

    if (result.added > 0) {
      console.log('✅ Export terminé avec succès !');
    } else {
      console.log('⚠️  Aucun nouvel email à exporter');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'export:', error);
    process.exit(1);
  }
}

exportAllFixtures().catch(console.error);

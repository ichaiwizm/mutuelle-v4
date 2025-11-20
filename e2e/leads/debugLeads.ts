#!/usr/bin/env tsx
/**
 * Debug script to see which emails are successfully parsed
 */
import { parseLead } from '@/main/leads/parsing/parser';

type EmailFixture = {
  id: string;
  subject: string;
  from: string;
  date: number;
  text: string;
};

console.log('\n🔍 ANALYSE DU PARSING DES 15 EMAILS:\n');
console.log('='.repeat(80));

let totalLeads = 0;

for (let i = 1; i <= 15; i++) {
  const filename = `email-${String(i).padStart(3, '0')}.json`;

  try {
    const email = require(`../../src/main/__tests__/fixtures/emails/${filename}`) as EmailFixture;

    // Parser l'email
    const lead = parseLead(
      { text: email.text, subject: email.subject },
      { emailId: email.id, source: 'fixture' }
    );

    if (lead) {
      totalLeads++;
      console.log(`\n✅ ${filename}: PARSÉ avec succès`);
      console.log(`   Sujet: ${email.subject}`);
      console.log(`   De: ${email.from}`);
      console.log(`   Taille du texte: ${email.text.length} caractères`);

      // Afficher les infos du lead
      const sub = lead.subscriber as Record<string, unknown>;
      const proj = lead.project as Record<string, unknown> | undefined;

      console.log(`   → Souscripteur: ${sub.prenom} ${sub.nom}`);
      console.log(`   → Profession: ${sub.profession}`);

      if (proj?.conjoint) {
        console.log(`   → Avec conjoint`);
      }

      if (lead.children && lead.children.length > 0) {
        console.log(`   → ${lead.children.length} enfant(s)`);
      }
    } else {
      console.log(`\n❌ ${filename}: Parsé mais lead = null`);
      console.log(`   Sujet: ${email.subject}`);
      console.log(`   Taille du texte: ${email.text.length} caractères`);
    }
  } catch (error) {
    console.log(`\n⚠️  ${filename}: ERREUR de chargement`);
    console.log(`   Error: ${error}`);
  }
}

console.log('\n' + '='.repeat(80));
console.log(`\n📊 RÉSUMÉ: ${totalLeads} leads parsés avec succès sur 15 fichiers\n`);

import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import { setupTestCtx } from './testUtils';
import { parseLeads } from '../leads/parsing/parser';
import { LeadsService } from '../services/leadsService';
import emailMultiLead from './fixtures/emails/email-001.json';
import type { MailMsg } from '../mail/google/client';

describe('TEST RÉEL : Email de Nicolas Fragoso avec 11 leads', () => {
  let cleanup: (() => void) | undefined;

  beforeAll(async () => {
    const ctx = await setupTestCtx();
    cleanup = ctx.cleanup;
  });

  it('ÉTAPE 1: Vérifier que l\'email contient bien 11 leads', () => {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  ÉTAPE 1: ANALYSE DU VRAI EMAIL                        ║');
    console.log('╚════════════════════════════════════════════════════════╝');

    const email = emailMultiLead as MailMsg;

    console.log('\n📧 Email récupéré:');
    console.log(`   De: ${email.from}`);
    console.log(`   Sujet: ${email.subject}`);
    console.log(`   Date: ${new Date(email.date).toLocaleString('fr-FR')}`);
    console.log(`   Taille: ${email.text.length} caractères`);

    const transmissionCount = (email.text.match(/Transmission d['']une fiche/gi) || []).length;
    console.log(`\n   📊 Nombre de "Transmission d'une fiche": ${transmissionCount}`);
    console.log(`   ✅ ATTENDU: 11\n`);

    expect(transmissionCount).toBe(11);
    console.log('✅ PARFAIT : 11 leads détectés dans l\'email\n');
  });

  it('ÉTAPE 2: Parser les 11 leads', () => {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ÉTAPE 2: PARSING DES 11 LEADS                         ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const email = emailMultiLead as MailMsg;
    const leads = parseLeads(
      { text: email.text, subject: email.subject },
      { emailId: email.id, source: 'email' }
    );

    console.log(`📊 Nombre de leads parsés: ${leads.length}`);
    console.log(`✅ ATTENDU: 11\n`);

    expect(leads).toHaveLength(11);

    console.log('👥 Personnes extraites:\n');
    leads.forEach((lead, idx) => {
      const name = `${lead.subscriber?.nom} ${lead.subscriber?.prenom}`;
      const email = lead.subscriber?.email;
      const enfants = lead.children?.length || 0;
      const conjoint = lead.project?.conjoint ? 'Oui' : 'Non';

      console.log(`   ${(idx + 1).toString().padStart(2, ' ')}. ${name.padEnd(30)}`);
      console.log(`       Email: ${email}`);
      console.log(`       Enfants: ${enfants} | Conjoint: ${conjoint}`);
    });

    console.log('\n✅ PARFAIT : 11 personnes parsées avec succès\n');
  });

  it('ÉTAPE 3: Vérifier que tous les leads ont des données complètes', () => {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ÉTAPE 3: VÉRIFICATION DES DONNÉES                     ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const email = emailMultiLead as MailMsg;
    const leads = parseLeads(
      { text: email.text, subject: email.subject },
      { emailId: email.id, source: 'email' }
    );

    const leadsWithFullData = leads.filter(lead =>
      lead.subscriber?.nom &&
      lead.subscriber?.prenom &&
      lead.subscriber?.email &&
      lead.subscriber?.telephone
    );

    console.log(`📊 Leads avec données complètes: ${leadsWithFullData.length}/${leads.length}`);

    expect(leadsWithFullData.length).toBe(11);
    console.log('✅ PARFAIT : Tous les leads ont nom, prénom, email et téléphone\n');

    // Verify expected names
    const expectedNames = [
      'Behloul Nassera',
      'Calonne Antoine',
      'Cuzin Marion',
      'ZIETEK Sonia',
      'Peres Lucia',
      'Laurent Romain',
      'Marie-Antoine Philippe',
      'SAADA armand',
      'kaddouri said',
      'Convenant Pascale',
      'Robin Marie-helene',
    ];

    console.log('🔍 Vérification des noms attendus:\n');
    expectedNames.forEach((expectedName, idx) => {
      const lead = leads[idx];
      const actualName = `${lead.subscriber?.nom} ${lead.subscriber?.prenom}`;
      const match = actualName === expectedName;
      console.log(`   ${match ? '✅' : '❌'} Lead ${idx + 1}: ${actualName} ${match ? '' : `(attendu: ${expectedName})`}`);
      expect(actualName).toBe(expectedName);
    });

    console.log('\n✅ PARFAIT : Tous les noms correspondent\n');
  });

  it('ÉTAPE 4: Sauvegarder les 11 leads en DB', async () => {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ÉTAPE 4: SAUVEGARDE EN BASE DE DONNÉES               ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // Nettoyer la DB avant de commencer
    await LeadsService.deleteAll();

    const email = emailMultiLead as MailMsg;
    const leads = parseLeads(
      { text: email.text, subject: email.subject },
      { emailId: email.id, source: 'email' }
    );

    console.log('💾 Sauvegarde des 11 leads...\n');

    for (const lead of leads) {
      await LeadsService.create(lead);
    }

    const savedLeads = await LeadsService.list();
    console.log(`📊 Leads en DB: ${savedLeads.length}`);
    console.log(`✅ ATTENDU: 11\n`);

    expect(savedLeads).toHaveLength(11);
    console.log('✅ PARFAIT : 11 leads sauvegardés en DB\n');
  });

  it('ÉTAPE 5: Vérifier le multi-lead en DB (même emailId, UUIDs différents)', async () => {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ÉTAPE 5: VÉRIFICATION MULTI-LEADS EN DB              ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const allLeads = await LeadsService.list();

    // Group by emailId
    const leadsByEmailId: Record<string, any[]> = {};
    allLeads.forEach(lead => {
      const data = typeof lead.data === 'string' ? JSON.parse(lead.data) : lead.data;
      const emailId = data.project?.emailId;
      if (emailId) {
        if (!leadsByEmailId[emailId]) {
          leadsByEmailId[emailId] = [];
        }
        leadsByEmailId[emailId].push(lead);
      }
    });

    const emailIds = Object.keys(leadsByEmailId);
    console.log(`📊 Nombre d'emails uniques: ${emailIds.length}`);
    console.log(`✅ ATTENDU: 1 (tous les leads viennent du même email)\n`);

    expect(emailIds).toHaveLength(1);

    const [emailId, emailLeads] = Object.entries(leadsByEmailId)[0];
    console.log(`📧 Email ID: ${emailId}`);
    console.log(`📊 Nombre de leads: ${emailLeads.length}`);
    console.log(`✅ ATTENDU: 11\n`);

    expect(emailLeads).toHaveLength(11);

    // Verify all UUIDs are unique
    const uuids = emailLeads.map(l => l.id);
    const uniqueUuids = new Set(uuids);

    console.log(`🔑 UUIDs générés: ${uuids.length}`);
    console.log(`🔑 UUIDs uniques: ${uniqueUuids.size}`);
    console.log(`✅ ATTENDU: 11 (tous différents)\n`);

    expect(uniqueUuids.size).toBe(11);

    console.log('✅ PARFAIT : Tous les UUIDs sont uniques\n');

    // Show the leads
    console.log('👥 Leads en DB (même emailId, UUIDs différents):\n');
    emailLeads.forEach((lead, idx) => {
      const data = typeof lead.data === 'string' ? JSON.parse(lead.data) : lead.data;
      const name = `${data.subscriber?.nom} ${data.subscriber?.prenom}`;
      console.log(`   ${(idx + 1).toString().padStart(2, ' ')}. ${name.padEnd(30)} UUID: ${lead.id.substring(0, 8)}...`);
    });

    console.log('\n✅ PARFAIT : 11 leads avec le même emailId mais des UUIDs différents\n');

    // Verify all are different people
    const uniqueEmails = new Set(
      emailLeads.map(l => {
        const data = typeof l.data === 'string' ? JSON.parse(l.data) : l.data;
        return data.subscriber?.email;
      })
    );

    console.log(`📊 Personnes différentes: ${uniqueEmails.size}/11`);
    expect(uniqueEmails.size).toBe(11);
    console.log('✅ PARFAIT : 11 personnes DIFFÉRENTES (pas de doublons)\n');

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ✅ SYSTÈME MULTI-LEADS 100% FONCTIONNEL              ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
  });
});

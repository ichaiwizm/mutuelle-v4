import 'dotenv/config';
import { createGmailClientFromTokens } from '../src/main/mail/google/client';
import { buildGmailQuery } from '../src/main/mail/query';
import { matchesProvider } from '../src/main/mail/filters';
import { LEAD_PROVIDERS } from '../src/main/mail/providers';
import { OAUTH_CONFIG } from '../src/main/mail/constants';

async function findMultiLeadEmail() {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN!;
  const accountEmail = process.env.GOOGLE_ACCOUNT_EMAIL || 'me';

  const client = await createGmailClientFromTokens({
    accessToken: '',
    refreshToken,
    expiry: new Date(Date.now() + OAUTH_CONFIG.TOKEN_EXPIRY_MS),
    accountEmail,
  });

  console.log('🔍 Recherche d\'emails avec PLUSIEURS "Transmission d\'une fiche"...\n');

  const query = buildGmailQuery(30);
  const ids = await client.listMessages(query);

  console.log(`📧 ${ids.length} emails à analyser\n`);

  let found = 0;
  for (let i = 0; i < Math.min(ids.length, 100); i++) {
    const message = await client.getMessage(ids[i]);

    if (!matchesProvider(message.from, LEAD_PROVIDERS)) {
      continue;
    }

    // Count "Transmission d'une fiche" occurrences
    const transmissionCount = (message.text.match(/Transmission d['']une fiche/gi) || []).length;

    if (transmissionCount > 1) {
      found++;
      console.log('🎯 EMAIL MULTI-LEADS TROUVÉ !');
      console.log(`   ID: ${message.id}`);
      console.log(`   Subject: ${message.subject}`);
      console.log(`   From: ${message.from}`);
      console.log(`   Date: ${new Date(message.date).toLocaleString('fr-FR')}`);
      console.log(`   Nombre de "Transmission d'une fiche": ${transmissionCount}`);
      console.log(`   Taille: ${message.text.length} caractères\n`);

      // Extract names from first 500 chars of each transmission
      const blocks = message.text.split(/Transmission d['']une fiche/i);
      console.log('   Leads détectés:');
      blocks.slice(1).forEach((block, idx) => {
        const nomMatch = block.match(/Nom\s*:\s*([^\r\n]+)/i);
        const prenomMatch = block.match(/Prénom\s*:\s*([^\r\n]+)/i);
        if (nomMatch && prenomMatch) {
          console.log(`      ${idx + 1}. ${nomMatch[1].trim()} ${prenomMatch[1].trim()}`);
        }
      });
      console.log('');
    }
  }

  if (found === 0) {
    console.log('❌ Aucun email multi-leads trouvé dans les 100 premiers emails');
  } else {
    console.log(`✅ ${found} email(s) multi-leads trouvé(s)`);
  }
}

findMultiLeadEmail().catch(console.error);

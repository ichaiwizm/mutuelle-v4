import 'dotenv/config';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { createGmailClientFromTokens } from '../src/main/mail/google/client';
import { buildGmailQuery } from '../src/main/mail/query';
import { matchesProvider } from '../src/main/mail/filters';
import { LEAD_PROVIDERS } from '../src/main/mail/providers';
import type { MailMsg } from '../src/main/mail/google/client';

async function main() {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN!;
  const accountEmail = process.env.GOOGLE_ACCOUNT_EMAIL || 'me';

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing GOOGLE_* env variables');
  }

  console.log('🔑 Creating Gmail client...');
  const client = await createGmailClientFromTokens({
    accessToken: '',
    refreshToken,
    expiry: new Date(Date.now() + 3600000),
    accountEmail,
  });

  const days = Number(process.env.GMAIL_TEST_DAYS || 300);
  console.log(`📧 Fetching emails from last ${days} days...`);

  const query = buildGmailQuery(days);
  const ids = await client.listMessages(query);
  console.log(`   Found ${ids.length} total emails`);

  console.log('📬 Filtering and fetching matched emails...');
  const matchedEmails: MailMsg[] = [];

  for (let i = 0; i < ids.length; i++) {
    const msg = await client.getMessage(ids[i]);
    if (matchesProvider(msg.from, LEAD_PROVIDERS)) {
      matchedEmails.push(msg);
      console.log(`   ✓ [${matchedEmails.length}] ${msg.from} - ${msg.subject}`);
    }

    if ((i + 1) % 50 === 0) {
      console.log(`   Progress: ${i + 1}/${ids.length} (${matchedEmails.length} matched)`);
    }
  }

  console.log(`\n💾 Saving ${matchedEmails.length} emails as fixtures...`);
  const fixturesDir = join(__dirname, '../src/main/__tests__/fixtures/emails');

  matchedEmails.forEach((email, idx) => {
    const filename = `email-${String(idx + 1).padStart(3, '0')}.json`;
    const filepath = join(fixturesDir, filename);
    writeFileSync(filepath, JSON.stringify(email, null, 2), 'utf-8');
    console.log(`   ✓ Saved ${filename}`);
  });

  console.log(`\n✅ Done! Saved ${matchedEmails.length} email fixtures`);
}

main().catch(console.error);

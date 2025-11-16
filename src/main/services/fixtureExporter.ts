import { readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { buildGmailQuery } from '@/main/mail/query';
import type { GmailClient, MailMsg } from '@/main/mail/google/client';
import { createGmailClientFromTokens } from '@/main/mail/google/client';
import { matchesProvider } from '@/main/mail/filters';
import { LEAD_PROVIDERS } from '@/main/mail/providers';
import { MailAuthService } from './mailAuthService';

const FIXTURES_DIR = join(__dirname, '../__tests__/fixtures/emails');

async function ensureClient(provided: GmailClient | undefined): Promise<GmailClient> {
  if (provided) return provided;

  const token = await MailAuthService.requireToken();
  return createGmailClientFromTokens({
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    expiry: new Date(token.expiry),
    accountEmail: token.accountEmail,
  });
}

function getExistingFixtureIds(): Set<string> {
  try {
    const files = readdirSync(FIXTURES_DIR);
    const emailIds = new Set<string>();

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = require(join(FIXTURES_DIR, file));
        if (content.id) {
          emailIds.add(content.id);
        }
      }
    }

    return emailIds;
  } catch (error) {
    return new Set();
  }
}

function getNextFixtureNumber(): number {
  try {
    const files = readdirSync(FIXTURES_DIR);
    const numbers = files
      .filter(f => f.match(/^email-\d{3}\.json$/))
      .map(f => parseInt(f.match(/\d{3}/)![0], 10));

    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  } catch (error) {
    return 1;
  }
}

function saveFixture(email: MailMsg, number: number): void {
  const filename = `email-${String(number).padStart(3, '0')}.json`;
  const filepath = join(FIXTURES_DIR, filename);
  const content = JSON.stringify(email, null, 2);
  writeFileSync(filepath, content + '\n', 'utf-8');
}

export const FixtureExporter = {
  async exportEmailsToFixtures(
    days: number,
    client?: GmailClient
  ): Promise<{ added: number; skipped: number; errors: string[] }> {
    const q = buildGmailQuery(days);
    const c = await ensureClient(client);
    const ids = await c.listMessages(q);

    const existingIds = getExistingFixtureIds();
    let nextNumber = getNextFixtureNumber();
    let added = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        // Skip if already exists
        if (existingIds.has(id)) {
          skipped++;
          continue;
        }

        // Fetch message
        const message = await c.getMessage(id);

        // Only export emails from lead providers
        if (!matchesProvider(message.from, LEAD_PROVIDERS)) {
          skipped++;
          continue;
        }

        // Save to fixtures
        saveFixture(message, nextNumber);
        added++;
        nextNumber++;
      } catch (error) {
        errors.push(`Failed to export email ${id}: ${error}`);
      }
    }

    return { added, skipped, errors };
  },
};

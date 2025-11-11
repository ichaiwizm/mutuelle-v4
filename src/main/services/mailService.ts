import { db, schema } from '../db';
import { buildGmailQuery } from '@/main/mail/query';
import type { GmailClient } from '@/main/mail/google/client';
import { createGmailClientFromTokens } from '@/main/mail/google/client';
import { Detectors } from '@/main/mail/detectors';
import { LeadsService } from './leadsService';

async function ensureClient(provided: GmailClient | undefined) {
  if (provided) return provided;
  const [row] = await db.select().from(schema.oauthTokens);
  if (!row) throw new Error('No OAuth tokens');
  return createGmailClientFromTokens({
    accessToken: row.accessToken,
    refreshToken: row.refreshToken,
    expiry: new Date(row.expiry),
    accountEmail: row.accountEmail,
  });
}

export const MailService = {
  async fetch(days: number, client?: GmailClient) {
    const rows = await db.select().from(schema.oauthTokens);
    if (!rows[0]) throw new Error('No OAuth tokens');
    const q = buildGmailQuery(days);
    const c = await ensureClient(client);
    const ids = await c.listMessages(q);
    let scanned = 0, matched = 0, created = 0;
    for (const id of ids) {
      const m = await c.getMessage(id); scanned++;
      for (const det of Detectors) {
        const found = det.detect(m);
        for (const cand of found) {
          matched++;
          const res = await LeadsService.create({ subscriber: cand.subscriber });
          if (res?.id) created++;
        }
      }
    }
    return { fetched: ids.length, scanned, matched, created };
  },
};

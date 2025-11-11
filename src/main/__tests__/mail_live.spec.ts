import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestCtx } from './testUtils';
import { google } from 'googleapis';
import type { GmailClient } from '@/main/mail/google/client';
import { buildGmailQuery } from '@/main/mail/query';
import { MailService } from '@/main/services/mailService';
import { MailAuthService } from '@/main/services/mailAuthService';

const LIVE = (process.env.GMAIL_LIVE_TEST === '1' || process.env.GMAIL_LIVE_TEST === 'true' || !!process.env.GOOGLE_REFRESH_TOKEN);
const maybe = LIVE ? describe : describe.skip;

class LiveWrapper implements GmailClient {
  constructor(private gmail: ReturnType<typeof google.gmail>) {}
  async listMessages(q: string) {
    const res = await this.gmail.users.messages.list({ userId: 'me', q, maxResults: 10 });
    return (res.data.messages || []).map(m => m.id!).filter(Boolean);
  }
  async getMessage(id: string) {
    const res = await this.gmail.users.messages.get({ userId: 'me', id, format: 'full' });
    const payload = res.data.payload;
    const headers = Object.fromEntries((payload?.headers || []).map(h => [String(h.name).toLowerCase(), String(h.value || '')]));
    const subject = headers['subject'] || '';
    const from = headers['from'] || '';
    const date = Number(res.data.internalDate || Date.now());
    const bodyPart = (payload?.parts || []).find(p => p.mimeType?.startsWith('text/plain')) || payload;
    const data = bodyPart?.body?.data || '';
    const text = data ? Buffer.from(data.replace(/-/g,'+').replace(/_/g,'/'), 'base64').toString('utf8') : '';
    return { id, subject, from, date, text };
  }
}

maybe('Gmail LIVE', () => {
  let cleanup: () => void; let db: any; let schema: any;
  beforeAll(async () => { const ctx = await setupTestCtx(); cleanup = ctx.cleanup; db = ctx.db; schema = ctx.schema; });
  afterAll(() => { cleanup?.(); });

  it('lists real messages and runs fetch', { timeout: 30000 }, async () => {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN!;
    const accountEmail = process.env.GOOGLE_ACCOUNT_EMAIL || 'me';
    if (!clientId || !clientSecret || !refreshToken) throw new Error('Missing GOOGLE_* env');
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
    oauth2.setCredentials({ refresh_token: refreshToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2 });
    const q = buildGmailQuery(Number(process.env.GMAIL_TEST_DAYS || 1));
    const ids = (await gmail.users.messages.list({ userId: 'me', q, maxResults: 5 })).data.messages || [];
    expect(Array.isArray(ids)).toBe(true);
    const wrapper = new LiveWrapper(gmail);
    // Ensure tokens row exists for service precondition
    await MailAuthService.saveTokens({
      provider: 'google',
      accountEmail,
      accessToken: '',
      refreshToken,
      expiry: new Date(Date.now() + 3600_000),
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
    });
    const res = await MailService.fetch(Number(process.env.GMAIL_TEST_DAYS || 1), wrapper);
    expect(res.fetched).toBeGreaterThanOrEqual(0);
    expect(res.scanned).toBeGreaterThanOrEqual(res.fetched);
  });
});
import 'dotenv/config';

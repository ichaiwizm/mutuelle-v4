import 'dotenv/config';
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
    const res = await this.gmail.users.messages.list({ userId: 'me', q, maxResults: 500 });
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
  let cleanup: (() => void) | undefined;
  beforeAll(async () => {
    const ctx = await setupTestCtx();
    cleanup = ctx.cleanup;
  });
  afterAll(() => {
    cleanup?.();
  });

  it('lists real messages and filters by provider', { timeout: 120000 }, async () => {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN!;
    const accountEmail = process.env.GOOGLE_ACCOUNT_EMAIL || 'me';
    if (!clientId || !clientSecret || !refreshToken) throw new Error('Missing GOOGLE_* env');
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
    oauth2.setCredentials({ refresh_token: refreshToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2 });
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
    const res = await MailService.fetch(Number(process.env.GMAIL_TEST_DAYS || 1), wrapper, {
      verbose: true,
      concurrency: 20  // 20 emails en parallèle pour accélérer
    });

    console.log('\n📧 Gmail Fetch Results:');
    console.log(`   Fetched: ${res.fetched} emails`);
    console.log(`   Matched: ${res.matched} emails from known providers`);
    console.log(`   Rate: ${res.fetched > 0 ? ((res.matched / res.fetched) * 100).toFixed(1) : 0}%`);

    if (res.matchedEmails && res.matchedEmails.length > 0) {
      console.log('\n   📬 Matched emails:');
      res.matchedEmails.forEach((email, i) => {
        console.log(`   ${i + 1}. From: ${email.from}`);
        console.log(`      Subject: ${email.subject}`);
      });
    }
    console.log();

    expect(res.fetched).toBeGreaterThanOrEqual(0);
    expect(res.matched).toBeGreaterThanOrEqual(0);
    expect(res.matched).toBeLessThanOrEqual(res.fetched);
  });
});

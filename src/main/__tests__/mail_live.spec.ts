import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestCtx } from './testUtils';
import { createGmailClientFromTokens } from '@/main/mail/google/client';
import { MailService } from '@/main/services/mailService';
import { MailAuthService } from '@/main/services/mailAuthService';
import { TEST_CONFIG, OAUTH_CONFIG } from '@/main/mail/constants';

const LIVE = (process.env.GMAIL_LIVE_TEST === '1' || process.env.GMAIL_LIVE_TEST === 'true' || !!process.env.GOOGLE_REFRESH_TOKEN);
const maybe = LIVE ? describe : describe.skip;

maybe('Gmail LIVE', () => {
  let cleanup: (() => void) | undefined;
  beforeAll(async () => {
    const ctx = await setupTestCtx();
    cleanup = ctx.cleanup;
  });
  afterAll(() => {
    cleanup?.();
  });

  it('lists real messages and filters by provider', { timeout: TEST_CONFIG.GMAIL_LIVE_TEST_TIMEOUT_MS }, async () => {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN!;
    const accountEmail = process.env.GOOGLE_ACCOUNT_EMAIL || 'me';
    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Missing GOOGLE_* env variables. Please configure OAuth credentials.');
    }

    // Save tokens to database for the test
    await MailAuthService.saveTokens({
      provider: OAUTH_CONFIG.PROVIDER_GOOGLE,
      accountEmail,
      accessToken: '',
      refreshToken,
      expiry: new Date(Date.now() + OAUTH_CONFIG.TOKEN_EXPIRY_MS),
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
    });

    // Use the REAL production client - this actually tests our code!
    const client = await createGmailClientFromTokens({
      accessToken: '',
      refreshToken,
      expiry: new Date(Date.now() + OAUTH_CONFIG.TOKEN_EXPIRY_MS),
      accountEmail,
    });

    const res = await MailService.fetch(Number(process.env.GMAIL_TEST_DAYS || 1), client, {
      verbose: true,
      concurrency: TEST_CONFIG.TEST_CONCURRENCY
    });

    console.log('\n📧 Gmail Fetch Results:');
    console.log(`   Fetched: ${res.fetched} emails`);
    console.log(`   Matched: ${res.matched} emails from known providers`);
    console.log(`   Detected: ${res.detected} valid leads`);
    console.log(`   Parsed: ${res.parsed} leads successfully parsed`);
    console.log(`   Saved: ${res.saved} leads saved to database`);
    console.log(`   Match Rate: ${res.fetched > 0 ? ((res.matched / res.fetched) * 100).toFixed(1) : 0}%`);
    console.log(`   Lead Rate: ${res.matched > 0 ? ((res.detected / res.matched) * 100).toFixed(1) : 0}%`);
    console.log(`   Success Rate: ${res.detected > 0 ? ((res.saved / res.detected) * 100).toFixed(1) : 0}%`);

    if (res.errors && res.errors.length > 0) {
      console.log('\n   ⚠️  Errors:');
      res.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    }

    if (res.matchedEmails && res.matchedEmails.length > 0) {
      console.log('\n   📬 Matched emails:');
      res.matchedEmails.forEach((email, i) => {
        const leadStatus = email.isLead ? `✓ LEAD (${email.provider})` : '✗ Not a lead';
        console.log(`   ${i + 1}. ${leadStatus}`);
        console.log(`      From: ${email.from}`);
        console.log(`      Subject: ${email.subject}`);
      });
    }
    console.log();

    expect(res.fetched).toBeGreaterThanOrEqual(0);
    expect(res.matched).toBeGreaterThanOrEqual(0);
    expect(res.matched).toBeLessThanOrEqual(res.fetched);
    expect(res.detected).toBeLessThanOrEqual(res.matched);
    expect(res.parsed).toBeLessThanOrEqual(res.detected);
    expect(res.saved).toBeLessThanOrEqual(res.parsed);
  });
});

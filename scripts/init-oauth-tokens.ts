/**
 * Script to initialize OAuth tokens from environment variables
 * Run with: npx tsx scripts/init-oauth-tokens.ts
 */

import 'dotenv/config';
import { MailAuthService } from '../src/main/services/mailAuthService';

async function main() {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const accountEmail = process.env.GOOGLE_ACCOUNT_EMAIL;

  if (!refreshToken || !accountEmail) {
    console.error('❌ Missing GOOGLE_REFRESH_TOKEN or GOOGLE_ACCOUNT_EMAIL in .env');
    process.exit(1);
  }

  console.log('🔐 Initializing OAuth tokens from .env...');
  console.log(`   Account: ${accountEmail}`);

  try {
    await MailAuthService.saveTokens({
      provider: 'google',
      accountEmail,
      accessToken: '', // Will be refreshed automatically
      refreshToken,
      expiry: new Date(0), // Expired, will trigger refresh
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
    });

    console.log('✅ OAuth tokens saved to database');

    // Verify
    const status = await MailAuthService.status();
    console.log(`   Status: ${status.ok ? '✅ OK' : '❌ Not OK'}`);
    if (status.ok) {
      console.log(`   Email: ${status.email}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

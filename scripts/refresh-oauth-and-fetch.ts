/**
 * Script to refresh OAuth tokens via browser flow and fetch Assurland fixtures
 * Run with: npx tsx scripts/refresh-oauth-and-fetch.ts
 */

import 'dotenv/config';
import { createServer, type Server } from 'node:http';
import { URL, URLSearchParams } from 'node:url';
import { randomBytes, createHash } from 'node:crypto';
import { exec } from 'node:child_process';
import { MailAuthService } from '../src/main/services/mailAuthService';
import { FixtureExporter } from '../src/main/services/fixtureExporter';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
const REDIRECT_PORT = 53682;
const REDIRECT_URI = `http://127.0.0.1:${REDIRECT_PORT}/oauth2/callback`;

function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

function openBrowser(url: string): void {
  const command = process.platform === 'win32'
    ? `start "" "${url}"`
    : process.platform === 'darwin'
    ? `open "${url}"`
    : `xdg-open "${url}"`;

  exec(command, (err) => {
    if (err) {
      console.log(`\n⚠️  Could not open browser automatically.`);
      console.log(`   Please open this URL manually:\n`);
      console.log(`   ${url}\n`);
    }
  });
}

async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  }

  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || error.error || 'Token exchange failed');
  }

  return response.json();
}

async function getUserEmail(accessToken: string): Promise<string> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to get user info');
  }

  const data = await response.json();
  return data.email;
}

async function doOAuthFlow(): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return { ok: false, error: 'Missing GOOGLE_CLIENT_ID' };
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = randomBytes(16).toString('hex');

  return new Promise((resolve) => {
    const server: Server = createServer(async (req, res) => {
      const url = new URL(req.url || '/', `http://127.0.0.1:${REDIRECT_PORT}`);

      if (url.pathname !== '/oauth2/callback') {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const code = url.searchParams.get('code');
      const returnedState = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

      if (error) {
        res.end(`<html><body><h1>❌ Error: ${error}</h1><p>You can close this window.</p></body></html>`);
        server.close();
        resolve({ ok: false, error });
        return;
      }

      if (!code || returnedState !== state) {
        res.end(`<html><body><h1>❌ Invalid response</h1><p>You can close this window.</p></body></html>`);
        server.close();
        resolve({ ok: false, error: 'Invalid authorization response' });
        return;
      }

      try {
        const tokens = await exchangeCodeForTokens(code, codeVerifier);
        const email = await getUserEmail(tokens.access_token);

        await MailAuthService.saveTokens({
          provider: 'google',
          accountEmail: email,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiry: new Date(Date.now() + tokens.expires_in * 1000),
          scope: tokens.scope,
        });

        res.end(`<html><body><h1>✅ Success!</h1><p>Connected as: ${email}</p><p>You can close this window.</p></body></html>`);
        server.close();
        resolve({ ok: true, email });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.end(`<html><body><h1>❌ Error</h1><p>${errorMessage}</p></body></html>`);
        server.close();
        resolve({ ok: false, error: errorMessage });
      }
    });

    server.listen(REDIRECT_PORT, '127.0.0.1', () => {
      const authParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: GMAIL_SCOPE,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        access_type: 'offline',
        prompt: 'consent',
      });

      const authUrl = `${GOOGLE_AUTH_URL}?${authParams.toString()}`;

      console.log('🌐 Please open this URL in your browser:\n');
      console.log(`   ${authUrl}\n`);
      console.log('   Waiting for authentication callback...\n');
      openBrowser(authUrl);

      // Timeout after 5 minutes
      setTimeout(() => {
        server.close();
        resolve({ ok: false, error: 'Timeout' });
      }, 5 * 60 * 1000);
    });

    server.on('error', (err) => {
      resolve({ ok: false, error: `Server error: ${err.message}` });
    });
  });
}

async function main() {
  console.log('🔐 Starting OAuth flow...');
  console.log('   A browser window will open. Please authenticate with Google.\n');

  const result = await doOAuthFlow();

  if (!result.ok) {
    console.error('❌ OAuth failed:', result.error);
    process.exit(1);
  }

  console.log(`✅ Connected as: ${result.email}\n`);

  console.log('🔍 Fetching Assurland fixtures from Gmail...');
  console.log('   Looking for emails from @assurland.com in the last 365 days\n');

  try {
    const exportResult = await FixtureExporter.exportEmailsToFixtures(365);

    console.log('✅ Export complete:');
    console.log(`   - Added: ${exportResult.added} new fixtures`);
    console.log(`   - Skipped: ${exportResult.skipped} (already exists or not from lead providers)`);

    if (exportResult.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      exportResult.errors.forEach(err => console.log(`   - ${err}`));
    }

    if (exportResult.added > 0) {
      console.log('\n📁 Fixtures saved to: src/main/__tests__/fixtures/emails/');
    }
  } catch (error) {
    console.error('❌ Error fetching fixtures:', error);
    process.exit(1);
  }
}

main();

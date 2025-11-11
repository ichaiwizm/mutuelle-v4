import 'dotenv/config';
import http from 'node:http';
import { exec } from 'node:child_process';
import { google } from 'googleapis';

const clientId = process.env.GOOGLE_CLIENT_ID || '';
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
const port = Number(process.env.GMAIL_AUTH_PORT || 53682);
const redirectUri = `http://127.0.0.1:${port}/oauth2/callback`;

if (!clientId || !clientSecret) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars first.');
  process.exit(1);
}

const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
const scopes = ['https://www.googleapis.com/auth/gmail.readonly','openid','email','profile'];
const url = oauth2.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: scopes });

const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith('/oauth2/callback')) { res.statusCode = 404; return res.end('Not Found'); }
  const u = new URL(req.url, redirectUri);
  const code = u.searchParams.get('code');
  if (!code) { res.statusCode = 400; return res.end('Missing code'); }
  try {
    const { tokens } = await oauth2.getToken(code);
    oauth2.setCredentials(tokens);
    const oidc = google.oauth2({ version: 'v2', auth: oauth2 });
    const me = await oidc.userinfo.get();
    const email = me.data.email || '';
    res.end('Auth OK. You can close this tab.');
    console.log('\nCopy these into your environment:');
    if (tokens.refresh_token) console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
    if (email) console.log('GOOGLE_ACCOUNT_EMAIL=' + email);
  } catch (e) {
    console.error(e);
    res.statusCode = 500; res.end('Auth error');
  } finally {
    setTimeout(() => server.close(), 500);
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log('Open this URL to grant access:\n' + url + '\n');
  try {
    const plat = process.platform;
    if (plat === 'darwin') exec(`open "${url}"`);
    else if (plat === 'win32') exec(`start "" "${url}"`, { shell: 'cmd.exe' });
    else exec(`xdg-open "${url}"`);
  } catch {}
});

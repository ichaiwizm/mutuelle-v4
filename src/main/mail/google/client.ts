export type MailMsg = { id: string; subject: string; from: string; date: number; text: string };

export interface GmailClient {
  listMessages(q: string): Promise<string[]>;
  getMessage(id: string): Promise<MailMsg>;
}

// Factory using googleapis; loaded lazily so tests don't require it.
export async function createGmailClientFromTokens(tokens: {
  accessToken: string; refreshToken: string; expiry: Date;
  accountEmail: string;
}): Promise<GmailClient> {
  const { google } = await import('googleapis');
  const { OAuth2 } = google.auth;
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const oauth2 = new OAuth2(clientId, clientSecret);
  oauth2.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expiry_date: tokens.expiry.getTime(),
  });
  const gmail = google.gmail({ version: 'v1', auth: oauth2 });
  return {
    async listMessages(q: string) {
      const res = await gmail.users.messages.list({ userId: 'me', q, maxResults: 50 });
      return (res.data.messages || []).map(m => m.id!).filter(Boolean);
    },
    async getMessage(id: string) {
      const res = await gmail.users.messages.get({ userId: 'me', id, format: 'full' });
      const payload = res.data.payload;
      const headers = Object.fromEntries((payload?.headers || []).map(h => [String(h.name).toLowerCase(), String(h.value || '')]));
      const subject = headers['subject'] || '';
      const from = headers['from'] || '';
      const date = Number(res.data.internalDate || Date.now());
      const bodyPart = (payload?.parts || []).find(p => p.mimeType?.startsWith('text/plain')) || payload;
      const data = bodyPart?.body?.data || '';
      const text = data ? Buffer.from(data.replace(/-/g,'+').replace(/_/g,'/'), 'base64').toString('utf8') : '';
      return { id, subject, from, date, text };
    },
  } as GmailClient;
}

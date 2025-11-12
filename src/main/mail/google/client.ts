import { parseGmailMessage } from './parser';
import { GMAIL_API, GMAIL_CONFIG } from '../constants';

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
  const gmail = google.gmail({ version: GMAIL_API.VERSION, auth: oauth2 });

  return {
    async listMessages(q: string) {
      const res = await gmail.users.messages.list({
        userId: GMAIL_API.USER_ID,
        q,
        maxResults: GMAIL_CONFIG.MAX_RESULTS
      });
      return (res.data.messages || []).map(m => m.id!).filter(Boolean);
    },
    async getMessage(id: string) {
      const res = await gmail.users.messages.get({
        userId: GMAIL_API.USER_ID,
        id,
        format: GMAIL_API.MESSAGE_FORMAT
      });
      return parseGmailMessage(res.data);
    },
  } as GmailClient;
}

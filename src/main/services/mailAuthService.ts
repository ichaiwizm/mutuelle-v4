import { db, schema } from '../db';
import { eq, and } from 'drizzle-orm';
import { OAUTH_CONFIG } from '@/main/mail/constants';

export type TokenSet = {
  provider: 'google';
  accountEmail: string;
  accessToken: string;
  refreshToken: string;
  expiry: Date;
  scope: string;
};

export type OAuthToken = {
  id: number;
  provider: string;
  accountEmail: string;
  accessToken: string;
  refreshToken: string;
  expiry: Date;
  scope: string;
  updatedAt: Date;
};

const ERRORS = {
  NO_OAUTH_TOKENS: 'No OAuth tokens configured. Please authenticate with Gmail first.',
} as const;

export const MailAuthService = {
  /**
   * Retrieves the OAuth token for the specified provider
   * @param provider - OAuth provider ('google')
   * @returns Token object or null if not found
   */
  async getToken(provider: 'google' = OAUTH_CONFIG.PROVIDER_GOOGLE): Promise<OAuthToken | null> {
    const [row] = await db.select()
      .from(schema.oauthTokens)
      .where(eq(schema.oauthTokens.provider, provider));
    return row || null;
  },

  /**
   * Retrieves the OAuth token for the specified provider, throws if not found
   * @param provider - OAuth provider ('google')
   * @returns Token object
   * @throws Error if no token is configured
   */
  async requireToken(provider: 'google' = OAUTH_CONFIG.PROVIDER_GOOGLE): Promise<OAuthToken> {
    const token = await this.getToken(provider);
    if (!token) {
      throw new Error(ERRORS.NO_OAUTH_TOKENS);
    }
    return token;
  },

  async saveTokens(t: TokenSet) {
    const now = new Date();
    const existing = await db.select({ id: schema.oauthTokens.id })
      .from(schema.oauthTokens)
      .where(and(eq(schema.oauthTokens.provider, t.provider), eq(schema.oauthTokens.accountEmail, t.accountEmail)));
    if (existing[0]) {
      await db.update(schema.oauthTokens).set({
        accessToken: t.accessToken,
        refreshToken: t.refreshToken,
        expiry: t.expiry,
        scope: t.scope,
        updatedAt: now,
      }).where(eq(schema.oauthTokens.id, existing[0].id));
    } else {
      await db.insert(schema.oauthTokens).values({
        provider: t.provider,
        accountEmail: t.accountEmail,
        accessToken: t.accessToken,
        refreshToken: t.refreshToken,
        expiry: t.expiry,
        scope: t.scope,
        updatedAt: now,
      });
    }
  },

  async status() {
    const token = await this.getToken();
    if (!token) return { ok: false as const };
    return { ok: true as const, email: token.accountEmail };
  },
};


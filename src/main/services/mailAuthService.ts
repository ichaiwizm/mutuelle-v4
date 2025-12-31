import { db, schema } from '../db';
import { eq, and } from 'drizzle-orm';
import { OAUTH_CONFIG } from '@/main/mail/constants';
import { AuthError } from '@/shared/errors';
import { encryptValue, decryptValue, isEncrypted } from './mailAuth/encryption';
import type { TokenSet, OAuthToken } from './mailAuth/types';

export type { TokenSet, OAuthToken };

const ERRORS = {
  NO_OAUTH_TOKENS: 'No OAuth tokens configured. Please authenticate with Gmail first.',
} as const;

export const MailAuthService = {
  async getToken(provider: 'google' = OAUTH_CONFIG.PROVIDER_GOOGLE): Promise<OAuthToken | null> {
    const [row] = await db.select().from(schema.oauthTokens).where(eq(schema.oauthTokens.provider, provider));
    if (!row) return null;
    return { ...row, accessToken: decryptValue(row.accessToken), refreshToken: decryptValue(row.refreshToken) };
  },

  async requireToken(provider: 'google' = OAUTH_CONFIG.PROVIDER_GOOGLE): Promise<OAuthToken> {
    const token = await this.getToken(provider);
    if (!token) throw new AuthError(ERRORS.NO_OAUTH_TOKENS);
    return token;
  },

  async saveTokens(t: TokenSet) {
    const now = new Date();
    const encryptedAccessToken = encryptValue(t.accessToken);
    const encryptedRefreshToken = encryptValue(t.refreshToken);

    const existing = await db.select({ id: schema.oauthTokens.id }).from(schema.oauthTokens)
      .where(and(eq(schema.oauthTokens.provider, t.provider), eq(schema.oauthTokens.accountEmail, t.accountEmail)));

    if (existing[0]) {
      await db.update(schema.oauthTokens).set({
        accessToken: encryptedAccessToken, refreshToken: encryptedRefreshToken,
        expiry: t.expiry, scope: t.scope, updatedAt: now,
      }).where(eq(schema.oauthTokens.id, existing[0].id));
    } else {
      await db.insert(schema.oauthTokens).values({
        provider: t.provider, accountEmail: t.accountEmail,
        accessToken: encryptedAccessToken, refreshToken: encryptedRefreshToken,
        expiry: t.expiry, scope: t.scope, updatedAt: now,
      });
    }
  },

  async status() {
    const token = await this.getToken();
    if (!token) return { ok: false as const };
    return { ok: true as const, email: token.accountEmail };
  },

  async deleteTokens(provider: 'google', accountEmail: string): Promise<void> {
    await db.delete(schema.oauthTokens).where(and(
      eq(schema.oauthTokens.provider, provider),
      eq(schema.oauthTokens.accountEmail, accountEmail)
    ));
  },

  async migrateUnencrypted(): Promise<number> {
    const rows = await db.select().from(schema.oauthTokens);
    let migrated = 0;
    for (const row of rows) {
      const accessNeedsEncryption = !isEncrypted(row.accessToken);
      const refreshNeedsEncryption = !isEncrypted(row.refreshToken);
      if (accessNeedsEncryption || refreshNeedsEncryption) {
        await db.update(schema.oauthTokens).set({
          accessToken: accessNeedsEncryption ? encryptValue(row.accessToken) : row.accessToken,
          refreshToken: refreshNeedsEncryption ? encryptValue(row.refreshToken) : row.refreshToken,
          updatedAt: new Date(),
        }).where(eq(schema.oauthTokens.id, row.id));
        migrated++;
      }
    }
    return migrated;
  },
};

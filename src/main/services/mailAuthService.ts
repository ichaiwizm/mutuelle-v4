import { db, schema } from '../db';
import { eq, and } from 'drizzle-orm';
import { OAUTH_CONFIG } from '@/main/mail/constants';
import { EncryptionService } from './encryptionService';

const ENCRYPTED_PREFIX = "ENC:";

function encryptValue(plaintext: string): string {
  return ENCRYPTED_PREFIX + EncryptionService.encryptToString(plaintext);
}

function decryptValue(stored: string): string {
  // Handle legacy unencrypted data
  if (!stored.startsWith(ENCRYPTED_PREFIX)) {
    return stored;
  }
  return EncryptionService.decryptFromString(stored.slice(ENCRYPTED_PREFIX.length));
}

function isEncrypted(stored: string): boolean {
  return stored.startsWith(ENCRYPTED_PREFIX);
}

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
   * Retrieves the OAuth token for the specified provider.
   * Tokens are automatically decrypted.
   * @param provider - OAuth provider ('google')
   * @returns Token object or null if not found
   */
  async getToken(provider: 'google' = OAUTH_CONFIG.PROVIDER_GOOGLE): Promise<OAuthToken | null> {
    const [row] = await db.select()
      .from(schema.oauthTokens)
      .where(eq(schema.oauthTokens.provider, provider));

    if (!row) return null;

    return {
      ...row,
      accessToken: decryptValue(row.accessToken),
      refreshToken: decryptValue(row.refreshToken),
    };
  },

  /**
   * Retrieves the OAuth token for the specified provider, throws if not found.
   * Tokens are automatically decrypted.
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

  /**
   * Saves OAuth tokens, encrypting sensitive fields.
   */
  async saveTokens(t: TokenSet) {
    const now = new Date();
    const encryptedAccessToken = encryptValue(t.accessToken);
    const encryptedRefreshToken = encryptValue(t.refreshToken);

    const existing = await db.select({ id: schema.oauthTokens.id })
      .from(schema.oauthTokens)
      .where(and(eq(schema.oauthTokens.provider, t.provider), eq(schema.oauthTokens.accountEmail, t.accountEmail)));

    if (existing[0]) {
      await db.update(schema.oauthTokens).set({
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiry: t.expiry,
        scope: t.scope,
        updatedAt: now,
      }).where(eq(schema.oauthTokens.id, existing[0].id));
    } else {
      await db.insert(schema.oauthTokens).values({
        provider: t.provider,
        accountEmail: t.accountEmail,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiry: t.expiry,
        scope: t.scope,
        updatedAt: now,
      });
    }
  },

  /**
   * Check authentication status.
   */
  async status() {
    const token = await this.getToken();
    if (!token) return { ok: false as const };
    return { ok: true as const, email: token.accountEmail };
  },

  /**
   * Delete tokens for a provider/account.
   */
  async deleteTokens(provider: 'google', accountEmail: string): Promise<void> {
    await db.delete(schema.oauthTokens)
      .where(and(
        eq(schema.oauthTokens.provider, provider),
        eq(schema.oauthTokens.accountEmail, accountEmail)
      ));
  },

  /**
   * Migrate unencrypted tokens to encrypted format.
   * Safe to call multiple times - only migrates unencrypted data.
   * Returns the number of records migrated.
   */
  async migrateUnencrypted(): Promise<number> {
    const rows = await db.select().from(schema.oauthTokens);
    let migrated = 0;

    for (const row of rows) {
      const accessNeedsEncryption = !isEncrypted(row.accessToken);
      const refreshNeedsEncryption = !isEncrypted(row.refreshToken);

      if (accessNeedsEncryption || refreshNeedsEncryption) {
        await db
          .update(schema.oauthTokens)
          .set({
            accessToken: accessNeedsEncryption ? encryptValue(row.accessToken) : row.accessToken,
            refreshToken: refreshNeedsEncryption ? encryptValue(row.refreshToken) : row.refreshToken,
            updatedAt: new Date(),
          })
          .where(eq(schema.oauthTokens.id, row.id));
        migrated++;
      }
    }

    return migrated;
  },
};

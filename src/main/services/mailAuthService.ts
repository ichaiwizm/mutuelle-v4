import { db, schema } from '../db';
import { eq, and } from 'drizzle-orm';

export type TokenSet = {
  provider: 'google';
  accountEmail: string;
  accessToken: string;
  refreshToken: string;
  expiry: Date;
  scope: string;
};

export const MailAuthService = {
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
    const rows = await db.select().from(schema.oauthTokens);
    if (!rows[0]) return { ok: false as const };
    return { ok: true as const, email: rows[0].accountEmail };
  },
};


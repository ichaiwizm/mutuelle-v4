import { db, schema } from "../db";
import { eq } from "drizzle-orm";

export const CredentialsService = {
  async upsert(p: { platform: string; login: string; password: string }) {
    const now = Date.now();
    const existing = await db
      .select({ id: schema.credentials.id })
      .from(schema.credentials)
      .where(eq(schema.credentials.platform, p.platform));

    if (existing[0]) {
      await db
        .update(schema.credentials)
        .set({ login: p.login, password: p.password, updatedAt: now })
        .where(eq(schema.credentials.id, existing[0].id));
    } else {
      await db.insert(schema.credentials).values({
        platform: p.platform,
        login: p.login,
        password: p.password,
        updatedAt: now,
      });
    }
  },

  async test(_platform: string) {
    // Stub pour l’instant
    return { ok: true as const };
  },
};

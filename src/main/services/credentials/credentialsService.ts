import { db, schema } from "@/main/db";
import { eq } from "drizzle-orm";
import { encryptValue, decryptValue, isEncrypted } from "./encryption";
import { testAlptisCredentials, testSwissLifeOneCredentials, testEntoriaCredentials } from "./testers";
import type { PlatformCredentials, CredentialsTestResult } from "./types";
import { logger } from "@/main/services/logger";

export const CredentialsService = {
  async upsert(p: { platform: string; login: string; password: string; courtierCode?: string }) {
    const now = new Date();
    const encryptedLogin = encryptValue(p.login);
    const encryptedPassword = encryptValue(p.password);
    const encryptedCourtierCode = p.courtierCode ? encryptValue(p.courtierCode) : null;

    const existing = await db.select({ id: schema.credentials.id }).from(schema.credentials)
      .where(eq(schema.credentials.platform, p.platform));

    if (existing[0]) {
      await db.update(schema.credentials).set({
        login: encryptedLogin, password: encryptedPassword,
        courtierCode: encryptedCourtierCode, updatedAt: now,
      }).where(eq(schema.credentials.id, existing[0].id));
    } else {
      await db.insert(schema.credentials).values({
        platform: p.platform, login: encryptedLogin, password: encryptedPassword,
        courtierCode: encryptedCourtierCode, updatedAt: now,
      });
    }
  },

  async getByPlatform(platform: string): Promise<PlatformCredentials | null> {
    logger.debug("Getting credentials", { service: "CREDENTIALS", platform });
    const rows = await db.select().from(schema.credentials).where(eq(schema.credentials.platform, platform)).limit(1);
    if (!rows[0]) {
      logger.debug("No credentials found", { service: "CREDENTIALS", platform });
      return null;
    }
    const row = rows[0];
    try {
      const result: PlatformCredentials = { platform: row.platform, login: decryptValue(row.login), password: decryptValue(row.password) };
      if (row.courtierCode) result.courtierCode = decryptValue(row.courtierCode);
      return result;
    } catch (error) {
      logger.error("Failed to decrypt credentials - deleting corrupted data", { service: "CREDENTIALS", platform });
      await this.delete(platform);
      return null;
    }
  },

  async listPlatforms(): Promise<string[]> {
    const rows = await db.select({ platform: schema.credentials.platform }).from(schema.credentials);
    return rows.map((r) => r.platform);
  },

  async delete(platform: string): Promise<void> {
    await db.delete(schema.credentials).where(eq(schema.credentials.platform, platform));
  },

  async migrateUnencrypted(): Promise<number> {
    const rows = await db.select().from(schema.credentials);
    let migrated = 0;
    for (const row of rows) {
      const loginNeedsEncryption = !isEncrypted(row.login);
      const passwordNeedsEncryption = !isEncrypted(row.password);
      if (loginNeedsEncryption || passwordNeedsEncryption) {
        await db.update(schema.credentials).set({
          login: loginNeedsEncryption ? encryptValue(row.login) : row.login,
          password: passwordNeedsEncryption ? encryptValue(row.password) : row.password,
          updatedAt: new Date(),
        }).where(eq(schema.credentials.id, row.id));
        migrated++;
      }
    }
    return migrated;
  },

  async test(platform: string): Promise<CredentialsTestResult> {
    const creds = await this.getByPlatform(platform);
    if (!creds) return { ok: false as const, error: "NO_CREDENTIALS" as const, message: `No credentials found for platform: ${platform}` };

    switch (platform.toLowerCase()) {
      case "alptis": return testAlptisCredentials(creds);
      case "swisslifeone":
      case "swisslife": return testSwissLifeOneCredentials(creds);
      case "entoria": return testEntoriaCredentials(creds);
      default: return { ok: false as const, error: "UNKNOWN_PLATFORM" as const, message: `Unknown platform: ${platform}` };
    }
  },
};

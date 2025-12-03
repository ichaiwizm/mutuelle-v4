import { db, schema } from "@/main/db";
import { eq } from "drizzle-orm";
import { encryptValue, decryptValue, isEncrypted } from "./encryption";
import { testAlptisCredentials, testSwissLifeOneCredentials } from "./testers";
import type { PlatformCredentials, CredentialsTestResult } from "./types";

export const CredentialsService = {
  /**
   * Insert or update credentials for a platform.
   * Credentials are automatically encrypted before storage.
   */
  async upsert(p: { platform: string; login: string; password: string }) {
    const now = new Date();
    const encryptedLogin = encryptValue(p.login);
    const encryptedPassword = encryptValue(p.password);

    const existing = await db
      .select({ id: schema.credentials.id })
      .from(schema.credentials)
      .where(eq(schema.credentials.platform, p.platform));

    if (existing[0]) {
      await db
        .update(schema.credentials)
        .set({
          login: encryptedLogin,
          password: encryptedPassword,
          updatedAt: now,
        })
        .where(eq(schema.credentials.id, existing[0].id));
    } else {
      await db.insert(schema.credentials).values({
        platform: p.platform,
        login: encryptedLogin,
        password: encryptedPassword,
        updatedAt: now,
      });
    }
  },

  /**
   * Get credentials for a platform.
   * Automatically decrypts stored data.
   * Returns null if no credentials exist for the platform.
   */
  async getByPlatform(platform: string): Promise<PlatformCredentials | null> {
    console.log(`[CREDENTIALS_SERVICE] getByPlatform() | platform: ${platform}`);
    const startTime = Date.now();

    console.log(`[CREDENTIALS_SERVICE] Querying database...`);
    const dbStart = Date.now();
    const rows = await db
      .select()
      .from(schema.credentials)
      .where(eq(schema.credentials.platform, platform))
      .limit(1);
    console.log(`[CREDENTIALS_SERVICE] DB query done in ${Date.now() - dbStart}ms | found: ${rows.length > 0}`);

    if (!rows[0]) {
      console.log(`[CREDENTIALS_SERVICE] No credentials found for platform: ${platform}`);
      return null;
    }

    const row = rows[0];
    console.log(`[CREDENTIALS_SERVICE] Decrypting credentials...`);
    const decryptStart = Date.now();
    const result = {
      platform: row.platform,
      login: decryptValue(row.login),
      password: decryptValue(row.password),
    };
    console.log(`[CREDENTIALS_SERVICE] Decryption done in ${Date.now() - decryptStart}ms`);
    console.log(`[CREDENTIALS_SERVICE] getByPlatform() done in ${Date.now() - startTime}ms total`);
    return result;
  },

  /**
   * List all platforms that have stored credentials.
   */
  async listPlatforms(): Promise<string[]> {
    const rows = await db
      .select({ platform: schema.credentials.platform })
      .from(schema.credentials);
    return rows.map((r) => r.platform);
  },

  /**
   * Delete credentials for a platform.
   */
  async delete(platform: string): Promise<void> {
    await db
      .delete(schema.credentials)
      .where(eq(schema.credentials.platform, platform));
  },

  /**
   * Migrate unencrypted credentials to encrypted format.
   * Safe to call multiple times - only migrates unencrypted data.
   * Returns the number of records migrated.
   */
  async migrateUnencrypted(): Promise<number> {
    const rows = await db.select().from(schema.credentials);
    let migrated = 0;

    for (const row of rows) {
      const loginNeedsEncryption = !isEncrypted(row.login);
      const passwordNeedsEncryption = !isEncrypted(row.password);

      if (loginNeedsEncryption || passwordNeedsEncryption) {
        await db
          .update(schema.credentials)
          .set({
            login: loginNeedsEncryption ? encryptValue(row.login) : row.login,
            password: passwordNeedsEncryption ? encryptValue(row.password) : row.password,
            updatedAt: new Date(),
          })
          .where(eq(schema.credentials.id, row.id));
        migrated++;
      }
    }

    return migrated;
  },

  /**
   * Test platform credentials by attempting to login.
   * Performs a real headless browser login test.
   */
  async test(platform: string): Promise<CredentialsTestResult> {
    // Get credentials for the platform
    const creds = await this.getByPlatform(platform);
    if (!creds) {
      return {
        ok: false as const,
        error: "NO_CREDENTIALS" as const,
        message: `No credentials found for platform: ${platform}`,
      };
    }

    // Route to platform-specific test
    switch (platform.toLowerCase()) {
      case "alptis":
        return testAlptisCredentials(creds);
      case "swisslifeone":
      case "swisslife":
        return testSwissLifeOneCredentials(creds);
      default:
        return {
          ok: false as const,
          error: "UNKNOWN_PLATFORM" as const,
          message: `Unknown platform: ${platform}. Supported: alptis, swisslifeone`,
        };
    }
  },
};

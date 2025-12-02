import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import { chromium, type Page } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Apply stealth plugin to avoid headless detection
chromium.use(StealthPlugin());

import { EncryptionService } from "./encryptionService";
import { AlptisAuth, ALPTIS_LOGIN_SELECTORS } from "../flows/platforms/alptis/lib/AlptisAuth";
import { SwissLifeOneAuth } from "../flows/platforms/swisslifeone/lib/SwissLifeOneAuth";
import { AlptisUrls } from "../flows/config/alptis.config";
import { setupAxeptioInterception } from "../flows/platforms/alptis/lib/cookie-interceptor";
import { setupCookieInterception as setupSwissLifeCookieInterception } from "../flows/platforms/swisslifeone/lib/cookie-interceptor";

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

export type PlatformCredentials = {
  platform: string;
  login: string;
  password: string;
};

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
    const rows = await db
      .select()
      .from(schema.credentials)
      .where(eq(schema.credentials.platform, platform))
      .limit(1);

    if (!rows[0]) {
      return null;
    }

    const row = rows[0];
    return {
      platform: row.platform,
      login: decryptValue(row.login),
      password: decryptValue(row.password),
    };
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

export type CredentialsTestResult =
  | { ok: true }
  | {
      ok: false;
      error: "NO_CREDENTIALS" | "UNKNOWN_PLATFORM" | "LOGIN_FAILED" | "TIMEOUT" | "BROWSER_ERROR";
      message: string;
    };

const TEST_TIMEOUT = 30000; // 30 seconds

/**
 * Test Alptis credentials with headless browser
 */
async function testAlptisCredentials(creds: PlatformCredentials): Promise<CredentialsTestResult> {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();

    // Setup cookie interception
    await setupAxeptioInterception(page, { debug: false });

    // Navigate to login page
    await page.goto(AlptisUrls.login, { timeout: TEST_TIMEOUT });

    // Wait for login fields
    await page.waitForSelector(ALPTIS_LOGIN_SELECTORS.username, {
      state: "visible",
      timeout: TEST_TIMEOUT,
    });

    // Fill credentials
    await page.fill(ALPTIS_LOGIN_SELECTORS.username, creds.login);
    await page.fill(ALPTIS_LOGIN_SELECTORS.password, creds.password);

    // Submit
    await page.click(ALPTIS_LOGIN_SELECTORS.submitButton);

    // Wait for either success (redirect away from auth) or error
    const result = await Promise.race([
      // Success: We're no longer on the auth page
      page
        .waitForURL((url) => !url.href.includes("/auth/"), {
          timeout: TEST_TIMEOUT,
        })
        .then(() => ({ success: true as const })),

      // Failure: Error message appears on the page
      page
        .waitForSelector(".kc-feedback-text, .alert-error, #input-error", {
          state: "visible",
          timeout: TEST_TIMEOUT,
        })
        .then(async (el) => {
          const text = await el.textContent();
          return { success: false as const, errorText: text?.trim() || "Login failed" };
        }),
    ]);

    if (result.success) {
      return { ok: true };
    } else {
      return {
        ok: false,
        error: "LOGIN_FAILED",
        message: result.errorText,
      };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("Timeout")) {
      return {
        ok: false,
        error: "TIMEOUT",
        message: "Login test timed out",
      };
    }

    return {
      ok: false,
      error: "BROWSER_ERROR",
      message,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Test SwissLife One credentials with headless browser
 */
async function testSwissLifeOneCredentials(creds: PlatformCredentials): Promise<CredentialsTestResult> {
  let browser;
  let page: Page | undefined;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });
    page = await context.newPage();

    await setupSwissLifeCookieInterception(page, { debug: false });

    const auth = new SwissLifeOneAuth({
      username: creds.login,
      password: creds.password,
    });

    await auth.navigateToLogin(page);
    await auth.clickSeConnecter(page);
    await auth.waitForAdfsPage(page);
    await auth.fillCredentials(page);
    await auth.submitLogin(page);

    // Wait for either dashboard (success) or error
    const result = await Promise.race([
      page
        .waitForURL(/\/accueil/, { timeout: TEST_TIMEOUT })
        .then(() => ({ success: true as const })),
      page
        .waitForSelector("#errorText, .error-message, .adfs-error", {
          state: "visible",
          timeout: TEST_TIMEOUT,
        })
        .then(async (el) => {
          const text = await el.textContent();
          return { success: false as const, errorText: text?.trim() || "Login failed" };
        }),
    ]);

    if (result.success) {
      return { ok: true };
    } else {
      return {
        ok: false,
        error: "LOGIN_FAILED",
        message: result.errorText,
      };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("Timeout")) {
      return {
        ok: false,
        error: "TIMEOUT",
        message: "Login test timed out",
      };
    }

    return {
      ok: false,
      error: "BROWSER_ERROR",
      message,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

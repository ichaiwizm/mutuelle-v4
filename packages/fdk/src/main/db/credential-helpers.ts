/**
 * Credential Helpers
 * Database operations for credentials
 */
import { eq } from "drizzle-orm";
import { getDb } from "./connection";
import { credentials } from "./credential-schema";
import type { PlatformCredentials, SaveCredentialsData } from "./credential-types";

export function findByPlatform(platform: string) {
  const { db } = getDb();
  return db.select().from(credentials).where(eq(credentials.platform, platform)).get();
}

export function findAll() {
  const { db } = getDb();
  return db.select().from(credentials).all();
}

export function findAllPlatforms(): string[] {
  const { db } = getDb();
  const rows = db.select({ platform: credentials.platform }).from(credentials).all();
  return rows.map((r) => r.platform);
}

export function mapRowToCredentials(row: {
  platform: string;
  login: string;
  password: string;
  courtierCode: string | null;
}): PlatformCredentials {
  return {
    platform: row.platform,
    username: row.login,
    password: row.password,
    courtierCode: row.courtierCode || undefined,
  };
}

export function updateCredentials(data: SaveCredentialsData): void {
  const { db } = getDb();
  db.update(credentials)
    .set({
      login: data.username,
      password: data.password,
      courtierCode: data.courtierCode || null,
      updatedAt: new Date(),
    })
    .where(eq(credentials.platform, data.platform))
    .run();
}

export function insertCredentials(data: SaveCredentialsData): void {
  const { db } = getDb();
  db.insert(credentials)
    .values({
      platform: data.platform,
      login: data.username,
      password: data.password,
      courtierCode: data.courtierCode || null,
      updatedAt: new Date(),
    })
    .run();
}

/**
 * Database Connection
 * Connects to the main app's SQLite database (shared DB)
 */
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

let cachedDb: ReturnType<typeof drizzle> | null = null;
let cachedSqlite: Database.Database | null = null;

function getUserDataDir(): string {
  const fromEnv = process.env.MUTUELLE_USER_DATA;
  if (fromEnv && fromEnv.length > 0) {
    mkdirSync(fromEnv, { recursive: true });
    return fromEnv;
  }
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const electronPath = join(home, ".config", "Electron");
  mkdirSync(electronPath, { recursive: true });
  return electronPath;
}

export function getDbPath(): string {
  const custom = process.env.MUTUELLE_DB_FILE;
  if (custom && custom.length > 0) return custom;
  return join(getUserDataDir(), "mutuelle.db");
}

export function getDb() {
  if (cachedDb && cachedSqlite) {
    return { db: cachedDb, sqlite: cachedSqlite };
  }
  const dbPath = getDbPath();
  cachedSqlite = new Database(dbPath);
  cachedSqlite.pragma("foreign_keys = ON");
  cachedDb = drizzle(cachedSqlite);
  return { db: cachedDb, sqlite: cachedSqlite };
}

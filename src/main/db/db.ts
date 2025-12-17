import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
// @ts-expect-error - better-sqlite3 has no official types
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { getUserDataDir } from "@/main/env";

export function resolveDbPath(name = "mutuelle.db") {
  const custom = process.env.MUTUELLE_DB_FILE;
  if (custom && custom.length > 0) return custom;
  const p = join(getUserDataDir(), name);
  mkdirSync(dirname(p), { recursive: true });
  return p;
}

export function openDb(dbPath = resolveDbPath()) {
  const sqlite = new Database(dbPath);
  // Enable foreign key constraints enforcement
  sqlite.pragma("foreign_keys = ON");
  return { drizzle: drizzle(sqlite), sqlite };
}

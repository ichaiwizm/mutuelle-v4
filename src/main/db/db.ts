import { app } from "electron";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

export function resolveDbPath(name = "mutuelle.db") {
  const p = join(app.getPath("userData"), name);
  mkdirSync(dirname(p), { recursive: true });
  return p;
}

export function openDb(dbPath = resolveDbPath()) {
  const sqlite = new Database(dbPath);
  return drizzle(sqlite);
}

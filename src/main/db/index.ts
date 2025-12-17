import { openDb } from "./db";
const { drizzle: drizzleDb, sqlite } = openDb();
export const db = drizzleDb;
export const sqliteDb = sqlite; // Raw SQLite connection for patches
export * as schema from "./schema";

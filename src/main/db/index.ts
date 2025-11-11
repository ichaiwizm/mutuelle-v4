import { openDb } from "./db";
export const db = openDb();
export * as schema from "./schema";

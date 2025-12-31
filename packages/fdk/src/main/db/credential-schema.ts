/**
 * Credential Schema
 * Drizzle schema for credentials table
 */
import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const credentials = sqliteTable(
  "credentials",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    platform: text("platform").notNull(),
    login: text("login").notNull(),
    password: text("password").notNull(),
    courtierCode: text("courtier_code"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => ({
    platformUnique: uniqueIndex("credentials_platform_unique").on(t.platform),
  })
);

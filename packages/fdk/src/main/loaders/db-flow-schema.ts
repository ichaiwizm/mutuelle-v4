/**
 * Database Flow Schema
 * Drizzle schema for flow_definitions table
 */
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const flowDefinitions = sqliteTable(
  "flow_definitions",
  {
    id: text("id").primaryKey(),
    flowKey: text("flow_key").notNull(),
    platform: text("platform").notNull(),
    product: text("product").notNull(),
    version: text("version").notNull(),
    yamlContent: text("yaml_content").notNull(),
    checksum: text("checksum").notNull(),
    status: text("status").notNull().default("draft"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => ({
    flowKeyIdx: index("flow_definitions_flow_key_idx").on(t.flowKey),
    statusIdx: index("flow_definitions_status_idx").on(t.status),
  })
);

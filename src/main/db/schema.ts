import { sqliteTable, integer, text, uniqueIndex } from "drizzle-orm/sqlite-core";

// Users/credentials (1 compte/plateforme)
export const credentials = sqliteTable(
  "credentials",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    platform: text("platform").notNull(), // "alptis" | "swisslife"
    login: text("login").notNull(),
    password: text("password").notNull(), // chiffré plus tard
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => ({
    platformUnique: uniqueIndex("credentials_platform_unique").on(t.platform),
  })
);

// Leads (simplifié)
export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),                   // uuid
  data: text("data").notNull(),                  // JSON string (schema Zod partagé)
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

// Flows (métadonnées déclaratives)
export const flows = sqliteTable("flows", {
  key: text("key").primaryKey(),                 // "alptis_sante_select"
  version: text("version").notNull(),            // "v1"
  title: text("title").notNull(),
});

// Runs & items (artefacts par step)
export const runs = sqliteTable("runs", {
  id: text("id").primaryKey(),                   // uuid
  status: text("status").notNull(),              // "queued"|"running"|"done"|"failed"
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const runItems = sqliteTable("run_items", {
  id: text("id").primaryKey(),                   // uuid
  runId: text("run_id").notNull(),               // FK runs.id
  flowKey: text("flow_key").notNull(),           // FK flows.key
  leadId: text("lead_id").notNull(),             // FK leads.id
  status: text("status").notNull(),
  artifactsDir: text("artifacts_dir").notNull(), // chemin dossier screenshots/vidéos
});

// OAuth tokens (Google)
export const oauthTokens = sqliteTable(
  "oauth_tokens",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    provider: text("provider").notNull(),          // 'google'
    accountEmail: text("account_email").notNull(),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token").notNull(),
    expiry: integer("expiry", { mode: "timestamp_ms" }).notNull(),
    scope: text("scope").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => ({ uniquePair: uniqueIndex("oauth_tokens_provider_email_unique").on(t.provider, t.accountEmail) })
);

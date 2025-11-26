import { sqliteTable, integer, text, uniqueIndex, primaryKey, index } from "drizzle-orm/sqlite-core";

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
  key: text("key").primaryKey(),                 // "swisslife_one_slsis"
  version: text("version").notNull(),            // "v1"
  title: text("title").notNull(),
});

// Runs & items (artefacts par step)
export const runs = sqliteTable("runs", {
  id: text("id").primaryKey(),                   // uuid
  status: text("status").notNull(),              // "queued"|"running"|"done"|"failed"|"cancelled"
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const runItems = sqliteTable("run_items", {
  id: text("id").primaryKey(),                   // uuid
  runId: text("run_id").notNull().references(() => runs.id, { onDelete: "cascade" }),
  flowKey: text("flow_key").notNull().references(() => flows.key, { onDelete: "restrict" }),
  leadId: text("lead_id").notNull().references(() => leads.id, { onDelete: "restrict" }),
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

// Product status (lifecycle management)
export const productStatus = sqliteTable(
  "product_status",
  {
    platform: text("platform").notNull(),          // "alptis" | "swisslife"
    product: text("product").notNull(),            // "sante_select" | "slsis"
    status: text("status").notNull().default("active"), // "active" | "inactive" | "beta" | "deprecated"
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    updatedBy: text("updated_by"),                 // optional until user management
  },
  (t) => ({
    pk: primaryKey({ columns: [t.platform, t.product] }),
  })
);

// Flow states (pause/resume functionality)
export const flowStates = sqliteTable(
  "flow_states",
  {
    id: text("id").primaryKey(),                           // uuid
    flowKey: text("flow_key").notNull().references(() => flows.key, { onDelete: "restrict" }),
    leadId: text("lead_id").references(() => leads.id, { onDelete: "set null" }),  // nullable, set null on lead deletion
    currentStepIndex: integer("current_step_index").notNull().default(0),
    completedSteps: text("completed_steps").notNull().default("[]"),    // JSON array of step IDs
    stepStates: text("step_states").default("{}"),                      // JSON object for intermediate state
    status: text("status").notNull().default("running"),   // "running" | "paused" | "completed" | "failed"
    startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
    pausedAt: integer("paused_at", { mode: "timestamp_ms" }),
    resumedAt: integer("resumed_at", { mode: "timestamp_ms" }),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => ({
    statusIdx: index("flow_states_status_idx").on(t.status),
    flowKeyIdx: index("flow_states_flow_key_idx").on(t.flowKey),
    leadIdIdx: index("flow_states_lead_id_idx").on(t.leadId),
  })
);

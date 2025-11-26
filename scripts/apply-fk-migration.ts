import Database from "better-sqlite3";
import { join } from "path";
import { getUserDataDir } from "../src/main/env";

const dbPath = process.env.MUTUELLE_DB_FILE || join(getUserDataDir(), "mutuelle.db");
console.log("DB path:", dbPath);

const db = new Database(dbPath);

// Check current schema
console.log("Current tables:");
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
console.log(tables.map((t) => t.name).join(", "));

// Check if flow_states table exists
const flowStatesExists = tables.some((t) => t.name === "flow_states");
if (!flowStatesExists) {
  console.log("\nCreating flow_states table with FKs...");
  db.exec(`
    CREATE TABLE flow_states (
      id text PRIMARY KEY NOT NULL,
      flow_key text NOT NULL,
      lead_id text,
      current_step_index integer DEFAULT 0 NOT NULL,
      completed_steps text DEFAULT '[]' NOT NULL,
      step_states text DEFAULT '{}',
      status text DEFAULT 'running' NOT NULL,
      started_at integer NOT NULL,
      paused_at integer,
      resumed_at integer,
      completed_at integer,
      created_at integer NOT NULL,
      updated_at integer NOT NULL,
      FOREIGN KEY (flow_key) REFERENCES flows(key) ON UPDATE no action ON DELETE restrict,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON UPDATE no action ON DELETE set null
    );
  `);
  db.exec(`CREATE INDEX flow_states_status_idx ON flow_states (status)`);
  db.exec(`CREATE INDEX flow_states_flow_key_idx ON flow_states (flow_key)`);
  db.exec(`CREATE INDEX flow_states_lead_id_idx ON flow_states (lead_id)`);
  console.log("flow_states table created with FKs");
}

// Check if FKs already exist by examining table info
const flowStatesInfo = db.prepare("PRAGMA foreign_key_list('flow_states')").all();
const runItemsInfo = db.prepare("PRAGMA foreign_key_list('run_items')").all();

console.log("\nflow_states FK:", flowStatesInfo.length ? "exists" : "none");
console.log("run_items FK:", runItemsInfo.length ? "exists" : "none");

// Only migrate tables that don't have FKs yet
if (runItemsInfo.length === 0) {
  console.log("\nApplying FK migration to run_items...");

  db.exec("PRAGMA foreign_keys=OFF");

  db.exec(`
    CREATE TABLE __new_run_items (
      id text PRIMARY KEY NOT NULL,
      run_id text NOT NULL,
      flow_key text NOT NULL,
      lead_id text NOT NULL,
      status text NOT NULL,
      artifacts_dir text NOT NULL,
      FOREIGN KEY (run_id) REFERENCES runs(id) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (flow_key) REFERENCES flows(key) ON UPDATE no action ON DELETE restrict,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON UPDATE no action ON DELETE restrict
    );
  `);
  db.exec(`INSERT INTO __new_run_items SELECT * FROM run_items`);
  db.exec(`DROP TABLE run_items`);
  db.exec(`ALTER TABLE __new_run_items RENAME TO run_items`);
  console.log("run_items migrated");

  db.exec("PRAGMA foreign_keys=ON");
  console.log("Migration complete!");
} else if (flowStatesInfo.length > 0) {
  console.log("\nFKs already exist, nothing to do.");
}

// Cleanup: remove any leftover temp tables
const tempTables = tables.filter((t) => t.name.startsWith("__new_"));
for (const t of tempTables) {
  console.log(`Dropping temp table: ${t.name}`);
  db.exec(`DROP TABLE IF EXISTS "${t.name}"`);
}

// Verify
console.log("\nVerification:");
console.log("flow_states FK:", db.prepare("PRAGMA foreign_key_list('flow_states')").all());
console.log("run_items FK:", db.prepare("PRAGMA foreign_key_list('run_items')").all());

db.close();

// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

// Utilise la même DB que l'app Electron
const dbPath = process.env.MUTUELLE_DB_FILE ||
  `${process.env.HOME}/.config/Electron/mutuelle.db`;

export default defineConfig({
  dialect: "sqlite",
  out: "./drizzle",
  schema: "./src/main/db/schema.ts",
  dbCredentials: { url: `file:${dbPath}` },
});

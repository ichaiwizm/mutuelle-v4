// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  out: "./drizzle",           // migrations générées ici
  schema: "./src/main/db/schema.ts",
});

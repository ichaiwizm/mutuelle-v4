import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export const AlptisAdapter = {
  key: "alptis_sante_select",
  version: "v1",
  requiredFields: [],
  async execute(
    lead: unknown,
    creds: { login: string; password: string },
    ctx: { artifactsDir: string }
  ) {
    await mkdir(ctx.artifactsDir, { recursive: true });
    await writeFile(
      join(ctx.artifactsDir, "result.json"),
      JSON.stringify({ ok: true, vendor: "alptis", lead, usedCreds: !!creds.login }, null, 2)
    );
  },
};

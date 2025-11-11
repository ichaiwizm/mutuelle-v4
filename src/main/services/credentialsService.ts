export const CredentialsService = {
  async upsert(_p: { platform: string; login: string; password: string }) {
    // TODO: upsert in DB, hash later
  },
  async test(_platform: string) {
    // TODO: playwright login check (plus tard)
    return { ok: true as const };
  },
};

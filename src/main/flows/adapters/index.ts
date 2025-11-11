import { AlptisAdapter } from "./alptis";
import { SwissLifeAdapter } from "./swisslife";

export const Adapters: Record<
  string,
  {
    key: string;
    version: string;
    requiredFields: string[];
    execute: (
      lead: unknown,
      creds: { login: string; password: string },
      ctx: { artifactsDir: string }
    ) => Promise<void>;
  }
> = {
  [AlptisAdapter.key]: AlptisAdapter,
  [SwissLifeAdapter.key]: SwissLifeAdapter,
};


export type EngineOptions = {
  headless: boolean;
  parallelism: number;
  artifactsRoot: string;
};

export const Engine = {
  async runQueued(_opts: EngineOptions) {
    // TODO: consommer run_items "queued", exécuter adaptateurs, produire artefacts
  },
};

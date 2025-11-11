import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestCtx } from './testUtils';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

let cleanup: () => void;

describe('Adapters stubs', () => {
  beforeAll(async () => {
    const ctx = await setupTestCtx();
    cleanup = ctx.cleanup;
  });
  afterAll(() => { cleanup?.(); });

  it('AlptisAdapter writes result.json', async () => {
    const { AlptisAdapter } = await import('@/main/flows/adapters/alptis');
    const dir = join(process.env.MUTUELLE_USER_DATA!, 'artifacts-test', 'a');
    mkdirSync(dir, { recursive: true });
    await AlptisAdapter.execute({ foo: 1 }, { login: 'x', password: 'y' }, { artifactsDir: dir });
    const content = JSON.parse(readFileSync(join(dir, 'result.json'), 'utf-8'));
    expect(content.ok).toBe(true);
    expect(content.vendor).toBe('alptis');
    expect(content.usedCreds).toBe(true);
  });

  it('SwissLifeAdapter writes result.json', async () => {
    const { SwissLifeAdapter } = await import('@/main/flows/adapters/swisslife');
    const dir = join(process.env.MUTUELLE_USER_DATA!, 'artifacts-test', 'b');
    mkdirSync(dir, { recursive: true });
    await SwissLifeAdapter.execute({ foo: 1 }, { login: 'x', password: 'y' }, { artifactsDir: dir });
    const content = JSON.parse(readFileSync(join(dir, 'result.json'), 'utf-8'));
    expect(content.ok).toBe(true);
    expect(content.vendor).toBe('swisslife');
    expect(content.usedCreds).toBe(true);
  });
});

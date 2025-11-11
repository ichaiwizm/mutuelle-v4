import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestCtx } from './testUtils';

let cleanup: () => void; let db: any; let schema: any;

describe('CredentialsService', () => {
  beforeAll(async () => {
    const ctx = await setupTestCtx();
    cleanup = ctx.cleanup; db = ctx.db; schema = ctx.schema;
  });
  afterAll(() => { cleanup?.(); });

  it('upsert inserts then updates without duplicates; test() returns ok', async () => {
    const { CredentialsService } = await import('@/main/services/credentialsService');
    await (db as any).delete((schema as any).credentials);

    await CredentialsService.upsert({ platform: 'alptis', login: 'a', password: '1' });
    let rows = await (db as any).select().from((schema as any).credentials);
    expect(rows.length).toBe(1);
    const firstUpdatedAt = rows[0].updatedAt;

    await CredentialsService.upsert({ platform: 'alptis', login: 'b', password: '2' });
    rows = await (db as any).select().from((schema as any).credentials);
    expect(rows.length).toBe(1);
    expect(rows[0].login).toBe('b');
    expect(rows[0].password).toBe('2');
    expect(rows[0].updatedAt).not.toBe(firstUpdatedAt);

    const res = await CredentialsService.test('alptis');
    expect(res).toEqual({ ok: true });
  });
});

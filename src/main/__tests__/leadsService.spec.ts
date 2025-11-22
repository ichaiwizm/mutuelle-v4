import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestCtx } from './testUtils';
import { randomUUID } from 'node:crypto';

let cleanup: () => void;
let db: any; let schema: any;

describe('LeadsService', () => {
  beforeAll(async () => {
    const ctx = await setupTestCtx();
    cleanup = ctx.cleanup;
    db = ctx.db; schema = ctx.schema;
  });

  afterAll(() => { cleanup?.(); });

  it('create without id generates uuid and list returns id only', async () => {
    const { LeadsService } = await import('@/main/services/leadsService');
    await (db as any).delete((schema as any).leads);

    const { id } = await LeadsService.create({ subscriber: { firstName: 'Test' } });
    expect(id).toBeTypeOf('string');
    expect(id.length).toBeGreaterThanOrEqual(16);

    const list = await LeadsService.list();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(id);
    expect(list[0]).toHaveProperty('createdAt');
    expect(list[0]).toHaveProperty('updatedAt');
    expect(list[0]).toHaveProperty('data');

    const rows = await (db as any).select().from((schema as any).leads);
    expect(rows.length).toBe(1);
  });

  it('create with provided id keeps it, then remove deletes it', async () => {
    const { LeadsService } = await import('@/main/services/leadsService');
    await (db as any).delete((schema as any).leads);
    const fixedId = randomUUID();
    const { id } = await LeadsService.create({ id: fixedId, subscriber: {} });
    expect(id).toBe(fixedId);

    await LeadsService.remove(id);
    const list = await LeadsService.list();
    expect(list).toEqual([]);
  });

  it('invalid lead (bad id) throws', async () => {
    const { LeadsService } = await import('@/main/services/leadsService');
    await expect(LeadsService.create({ id: 'not-a-uuid', subscriber: {} } as any)).rejects.toBeTruthy();
  });
});

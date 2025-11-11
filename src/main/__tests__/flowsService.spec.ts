import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestCtx } from './testUtils';

let cleanup: () => void;

describe('FlowsService', () => {
  beforeAll(async () => {
    const ctx = await setupTestCtx();
    cleanup = ctx.cleanup;
  });
  afterAll(() => { cleanup?.(); });

  it('list returns seeded flows', async () => {
    const { FlowsService } = await import('@/main/services/flowsService');
    const flows = await FlowsService.list();
    expect(flows.map(f => f.key).sort()).toEqual(['alptis_sante_select','swisslife_one_slis']);
  });
});

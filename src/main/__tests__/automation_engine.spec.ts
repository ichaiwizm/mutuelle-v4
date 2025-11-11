import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestCtx } from './testUtils';
import { readFileSync, statSync } from 'node:fs';

let cleanup: () => void; let db: any; let schema: any;

describe('Automation + Engine (no mocks)', () => {
  beforeAll(async () => {
    const ctx = await setupTestCtx();
    cleanup = ctx.cleanup; db = ctx.db; schema = ctx.schema;
  });
  afterAll(() => { cleanup?.(); });

  it('happy path: enqueue -> engine writes artifact and statuses done', async () => {
    const { LeadsService } = await import('@/main/services/leadsService');
    await (db as any).delete((schema as any).runs);
    await (db as any).delete((schema as any).runItems);
    await (db as any).delete((schema as any).leads);
    await (db as any).delete((schema as any).credentials);
    const { CredentialsService } = await import('@/main/services/credentialsService');
    const { AutomationService } = await import('@/main/services/automationService');

    // creds + lead
    await CredentialsService.upsert({ platform: 'alptis', login: 'demo', password: 'demo' });
    const { id: leadId } = await LeadsService.create({ subscriber: { firstName: 'X' } });

    const { runId } = await AutomationService.enqueue([{ flowKey: 'alptis_sante_select', leadId }]);

    const items = await (db as any).select().from((schema as any).runItems);
    expect(items.length).toBe(1);
    expect(items[0].status).toBe('done');
    expect(items[0].artifactsDir).toContain(runId);

    const run = (await (db as any).select().from((schema as any).runs))[0];
    expect(run.status).toBe('done');

    const res = readFileSync(`${items[0].artifactsDir}/result.json`, 'utf-8');
    expect(() => statSync(`${items[0].artifactsDir}/result.json`)).not.toThrow();
    const json = JSON.parse(res);
    expect(json.ok).toBe(true);
    expect(json.vendor).toBe('alptis');
  });

  it('missing credentials -> item and run failed', async () => {
    const { LeadsService } = await import('@/main/services/leadsService');
    await (db as any).delete((schema as any).runs);
    await (db as any).delete((schema as any).runItems);
    await (db as any).delete((schema as any).leads);
    await (db as any).delete((schema as any).credentials);
    const { AutomationService } = await import('@/main/services/automationService');

    const { id: leadId } = await LeadsService.create({ subscriber: { firstName: 'Y' } });
    const { runId } = await AutomationService.enqueue([{ flowKey: 'alptis_sante_select', leadId }]);

    const items = await (db as any).select().from((schema as any).runItems);
    expect(items[0].status).toBe('failed');
    const run = (await (db as any).select().from((schema as any).runs))[0];
    expect(run.id).toBe(runId);
    expect(run.status).toBe('failed');
  });
});

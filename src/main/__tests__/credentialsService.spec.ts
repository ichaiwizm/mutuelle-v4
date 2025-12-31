import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestCtx } from './testUtils';

let cleanup: () => void; let db: any; let schema: any;

describe('CredentialsService', () => {
  beforeAll(async () => {
    const ctx = await setupTestCtx();
    cleanup = ctx.cleanup; db = ctx.db; schema = ctx.schema;
  });
  afterAll(() => { cleanup?.(); });

  it('upsert inserts then updates without duplicates', async () => {
    const { CredentialsService } = await import('@/main/services/credentials/credentialsService');
    await (db as any).delete((schema as any).credentials);

    // Insert first credential
    await CredentialsService.upsert({ platform: 'alptis', login: 'a', password: '1' });
    let rows = await (db as any).select().from((schema as any).credentials);
    expect(rows.length).toBe(1);
    const firstUpdatedAt = rows[0].updatedAt;

    // Verify decrypted values via service
    let creds = await CredentialsService.getByPlatform('alptis');
    expect(creds).not.toBeNull();
    expect(creds!.login).toBe('a');
    expect(creds!.password).toBe('1');

    // Update credential
    await CredentialsService.upsert({ platform: 'alptis', login: 'b', password: '2' });
    rows = await (db as any).select().from((schema as any).credentials);
    expect(rows.length).toBe(1); // Still only 1 row (update, not insert)
    expect(rows[0].updatedAt).not.toBe(firstUpdatedAt);

    // Verify updated decrypted values
    creds = await CredentialsService.getByPlatform('alptis');
    expect(creds).not.toBeNull();
    expect(creds!.login).toBe('b');
    expect(creds!.password).toBe('2');
  });

  it('stores credentials encrypted in database', async () => {
    const { CredentialsService } = await import('@/main/services/credentials/credentialsService');
    await (db as any).delete((schema as any).credentials);

    await CredentialsService.upsert({ platform: 'test', login: 'mylogin', password: 'secret123' });

    // Raw DB values should be encrypted (start with ENC:)
    const rows = await (db as any).select().from((schema as any).credentials);
    expect(rows[0].login).toMatch(/^ENC:1:/);
    expect(rows[0].password).toMatch(/^ENC:1:/);

    // But service returns decrypted values
    const creds = await CredentialsService.getByPlatform('test');
    expect(creds!.login).toBe('mylogin');
    expect(creds!.password).toBe('secret123');
  });

  it('getByPlatform returns null for non-existent platform', async () => {
    const { CredentialsService } = await import('@/main/services/credentials/credentialsService');
    const creds = await CredentialsService.getByPlatform('nonexistent');
    expect(creds).toBeNull();
  });

  it('listPlatforms returns all platforms', async () => {
    const { CredentialsService } = await import('@/main/services/credentials/credentialsService');
    await (db as any).delete((schema as any).credentials);

    await CredentialsService.upsert({ platform: 'alptis', login: 'a', password: '1' });
    await CredentialsService.upsert({ platform: 'swisslife', login: 'b', password: '2' });

    const platforms = await CredentialsService.listPlatforms();
    expect(platforms).toContain('alptis');
    expect(platforms).toContain('swisslife');
    expect(platforms.length).toBe(2);
  });

  it('delete removes credentials for platform', async () => {
    const { CredentialsService } = await import('@/main/services/credentials/credentialsService');
    await (db as any).delete((schema as any).credentials);

    await CredentialsService.upsert({ platform: 'todelete', login: 'a', password: '1' });
    expect(await CredentialsService.getByPlatform('todelete')).not.toBeNull();

    await CredentialsService.delete('todelete');
    expect(await CredentialsService.getByPlatform('todelete')).toBeNull();
  });

  it('test() returns NO_CREDENTIALS when no credentials exist', async () => {
    const { CredentialsService } = await import('@/main/services/credentials/credentialsService');
    await (db as any).delete((schema as any).credentials);

    const res = await CredentialsService.test('alptis');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe('NO_CREDENTIALS');
    }
  });

  it('test() returns UNKNOWN_PLATFORM for unsupported platforms', async () => {
    const { CredentialsService } = await import('@/main/services/credentials/credentialsService');
    await (db as any).delete((schema as any).credentials);

    // Add credentials for unknown platform
    await CredentialsService.upsert({ platform: 'unknown', login: 'test', password: 'test' });

    const res = await CredentialsService.test('unknown');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe('UNKNOWN_PLATFORM');
    }
  });

  it('migrateUnencrypted encrypts legacy plaintext credentials', async () => {
    const { CredentialsService } = await import('@/main/services/credentials/credentialsService');
    await (db as any).delete((schema as any).credentials);

    // Insert plaintext directly (simulating legacy data)
    await (db as any).insert((schema as any).credentials).values({
      platform: 'legacy',
      login: 'plainlogin',
      password: 'plainpassword',
      updatedAt: new Date(),
    });

    // Verify it's plaintext
    let rows = await (db as any).select().from((schema as any).credentials);
    expect(rows[0].login).toBe('plainlogin');
    expect(rows[0].password).toBe('plainpassword');

    // Run migration
    const migrated = await CredentialsService.migrateUnencrypted();
    expect(migrated).toBe(1);

    // Verify it's now encrypted in DB
    rows = await (db as any).select().from((schema as any).credentials);
    expect(rows[0].login).toMatch(/^ENC:1:/);
    expect(rows[0].password).toMatch(/^ENC:1:/);

    // But decrypts correctly
    const creds = await CredentialsService.getByPlatform('legacy');
    expect(creds!.login).toBe('plainlogin');
    expect(creds!.password).toBe('plainpassword');

    // Running migration again should migrate 0
    const migrated2 = await CredentialsService.migrateUnencrypted();
    expect(migrated2).toBe(0);
  });
});

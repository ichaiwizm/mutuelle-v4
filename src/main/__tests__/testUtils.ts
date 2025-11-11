import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

export type TestCtx = {
  userData: string;
  cleanup: () => void;
  db: any;
  schema: any;
};

export async function setupTestCtx(): Promise<TestCtx> {
  const userData = mkdtempSync(join(tmpdir(), 'mutuelle-userData-'));
  process.env.MUTUELLE_USER_DATA = userData;
  process.env.MUTUELLE_DB_FILE = join(userData, 'test.db');

  const { db, schema } = await import('@/main/db');
  const { default: path } = await import('node:path');
  const migrationsFolder = path.join(process.cwd(), 'drizzle');
  await migrate(db as any, { migrationsFolder });

  // seed flows minimal
  await (db as any).insert((schema as any).flows).values([
    { key: 'alptis_sante_select', version: 'v1', title: 'Alptis Santé Select' },
    { key: 'swisslife_one_slis', version: 'v1', title: 'SwissLife One SLIS' },
  ]);

  const cleanup = () => {
    try { rmSync(userData, { recursive: true, force: true }); } catch {}
    delete process.env.MUTUELLE_USER_DATA;
    delete process.env.MUTUELLE_DB_FILE;
  };

  return { userData, cleanup, db, schema };
}


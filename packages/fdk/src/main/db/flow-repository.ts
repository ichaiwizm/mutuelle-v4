/**
 * Flow Repository
 * Manages flow definitions in the shared database
 * NOTE: Database is lazy-loaded to avoid Electron/Node.js module conflicts
 */
import { createHash } from 'crypto';
import { eq } from 'drizzle-orm';

// Lazy load database to avoid Electron/Node native module issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _schema: any = null;

function getDb() {
  if (!_db) {
    // Dynamic import at runtime
    const dbModule = require('../../../../../src/main/db');
    _db = dbModule.db;
    _schema = dbModule.schema;
  }
  return { db: _db!, flowDefinitions: _schema!.flowDefinitions };
}

export interface FlowRecord {
  id: string;
  flowKey: string;
  platform: string;
  product: string;
  version: string;
  yamlContent: string;
  checksum: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

function generateChecksum(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

function generateId(): string {
  return crypto.randomUUID();
}

function extractPlatformProduct(flowKey: string): { platform: string; product: string } {
  const parts = flowKey.split('-');
  const platform = parts[0] || 'unknown';
  const product = parts.slice(1).join('-') || 'unknown';
  return { platform, product };
}

/** Publish a flow to the database */
export function publish(flowKey: string, yamlContent: string, version: string): FlowRecord {
  const { db, flowDefinitions } = getDb();
  const now = new Date();
  const checksum = generateChecksum(yamlContent);
  const { platform, product } = extractPlatformProduct(flowKey);

  const existing = db.select().from(flowDefinitions).where(eq(flowDefinitions.flowKey, flowKey)).get();

  if (existing) {
    db.update(flowDefinitions)
      .set({ yamlContent, checksum, version, status: 'active', updatedAt: now })
      .where(eq(flowDefinitions.flowKey, flowKey))
      .run();
    return { ...existing, yamlContent, checksum, version, status: 'active', updatedAt: now } as FlowRecord;
  }

  const id = generateId();
  const record = {
    id, flowKey, platform, product, version, yamlContent, checksum,
    status: 'active', createdAt: now, updatedAt: now,
  };

  db.insert(flowDefinitions).values(record).run();
  return record;
}

/** Get a flow by its key */
export function getByFlowKey(flowKey: string): FlowRecord | null {
  const { db, flowDefinitions } = getDb();
  const row = db.select().from(flowDefinitions).where(eq(flowDefinitions.flowKey, flowKey)).get();
  return row ? (row as FlowRecord) : null;
}

/** Get all published flows */
export function getAll(): FlowRecord[] {
  const { db, flowDefinitions } = getDb();
  return db.select().from(flowDefinitions).all() as FlowRecord[];
}

/** Delete a flow by key */
export function deleteByFlowKey(flowKey: string): boolean {
  const { db, flowDefinitions } = getDb();
  const result = db.delete(flowDefinitions).where(eq(flowDefinitions.flowKey, flowKey)).run();
  return result.changes > 0;
}

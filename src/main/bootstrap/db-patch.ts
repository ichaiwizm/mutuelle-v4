import { sqliteDb } from '../db'
import { logger } from '../services/logger'
import { captureException } from '../services/monitoring'

export function patchMissingColumns() {
  const tableExists = sqliteDb.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='product_automation_settings'
  `).get()

  if (!tableExists) return

  const tableInfo = sqliteDb.prepare('PRAGMA table_info(product_automation_settings)').all() as { name: string }[]
  const hasAutoSubmit = tableInfo.some((col) => col.name === 'auto_submit')

  if (!hasAutoSubmit) {
    logger.warn('Missing auto_submit column, patching...', { service: 'MAIN' })
    captureException(new Error('Missing auto_submit column - applying patch'), {
      tags: { context: 'db-migration-patch' }
    })
    sqliteDb.exec('ALTER TABLE product_automation_settings ADD auto_submit integer DEFAULT 1 NOT NULL')
    logger.info('Patched auto_submit column successfully', { service: 'MAIN' })
  }
}

import 'dotenv/config'
import { app, BrowserWindow, Menu } from 'electron'

// Initialize Sentry as early as possible for crash reporting
import { initSentry, flushSentry, captureException } from './services/monitoring'
initSentry()

// Global error handlers - catch uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('[MAIN] Uncaught exception:', error)
  captureException(error, { tags: { context: 'uncaught-exception' } })
})

process.on('unhandledRejection', (reason) => {
  console.error('[MAIN] Unhandled rejection:', reason)
  captureException(reason, { tags: { context: 'unhandled-rejection' } })
})

// Disable GPU for WSL2 compatibility
app.disableHardwareAcceleration()
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerIpc } from './ipc'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db, sqliteDb } from './db'
import { flows, productStatus } from './db/schema'
import { PRODUCT_CONFIGS } from './flows/config/products'
import { AutomationService } from './services/automation'
import { initAutoUpdater } from './services/autoUpdater'
import { logger, initLogger } from './services/logger'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Patch missing columns in the database that may have failed to apply during migrations.
 * This is a safety net for beta testers who have databases with incomplete migrations.
 */
function patchMissingColumns() {
  // Check if product_automation_settings table exists
  const tableExists = sqliteDb.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='product_automation_settings'
  `).get()

  if (!tableExists) return // Table doesn't exist yet, migrations will create it

  // Check if auto_submit column exists
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

async function createWindow(): Promise<BrowserWindow> {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
    },
  })
  // Cache et supprime toute barre de menu
  try { win.setMenuBarVisibility(false) } catch {}

  // Renderer crash detection (ignore clean exits)
  win.webContents.on('render-process-gone', (event, details) => {
    if (details.reason === 'clean-exit') return
    logger.error('Renderer process crashed', { service: 'MAIN' }, { reason: details.reason, exitCode: details.exitCode })
    captureException(new Error(`Renderer crashed: ${details.reason}`), {
      tags: { context: 'renderer-crash' },
      extra: { exitCode: details.exitCode, reason: details.reason },
    })
  })

  win.webContents.on('unresponsive', () => {
    logger.warn('Renderer became unresponsive', { service: 'MAIN' })
  })

  win.webContents.on('responsive', () => {
    logger.info('Renderer became responsive again', { service: 'MAIN' })
  })

  // DevTools toggle with F12
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      win.webContents.toggleDevTools()
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) await win.loadURL(process.env.ELECTRON_RENDERER_URL)
  else await win.loadFile(path.join(__dirname, '../renderer/index.html'))

  // Open DevTools in development
  if (process.env.ELECTRON_RENDERER_URL) win.webContents.openDevTools()

  return win
}

app.whenReady().then(async () => {
  // Initialize logger first
  initLogger()
  logger.info('Application starting', { service: 'MAIN' })

  // Supprime le menu d'application (File/Edit/View...)
  try { Menu.setApplicationMenu(null) } catch {}
  // --- migrations runtime KISS ---
  // En dev: drizzle/ est à la racine du projet (../../drizzle depuis out/main/)
  // En prod: drizzle/ est dans Resources via extraResources (process.resourcesPath)
  const isDev = !!process.env.ELECTRON_RENDERER_URL
  const migrationsFolder = isDev
    ? path.join(__dirname, '../../drizzle')
    : path.join(process.resourcesPath, 'drizzle')
  await migrate(db, { migrationsFolder })

  // Patch missing columns (safety net for beta testers with incomplete migrations)
  patchMissingColumns()

  // --- seeder flows (idempotent, aligné configs produits) ---
  const values = Object.values(PRODUCT_CONFIGS).map((config) => ({
    key: config.flowKey,
    version: 'v1',
    title: config.displayName,
  }))

  for (const v of values) {
    // Upsert par clé de flow
    await db
      .insert(flows)
      .values(v)
      .onConflictDoUpdate({
        target: flows.key,
        set: {
          version: v.version,
          title: v.title,
        },
      })
  }

  // --- cleanup orphaned runs from previous crash ---
  await AutomationService.cleanupOrphanedRuns()

  // --- seeder product_status (par défaut: active) ---
  const existingStatuses = await db
    .select({
      platform: productStatus.platform,
      product: productStatus.product,
    })
    .from(productStatus)

  const existingStatusKeys = new Set(
    existingStatuses.map((s) => `${s.platform}:${s.product}`)
  )

  for (const config of Object.values(PRODUCT_CONFIGS)) {
    const key = `${config.platform}:${config.product}`
    if (existingStatusKeys.has(key)) continue

    await db.insert(productStatus).values({
      platform: config.platform,
      product: config.product,
      status: 'active',
      updatedAt: new Date(),
      updatedBy: null,
    })
  }

  registerIpc()
  const mainWindow = await createWindow()

  // Initialise l'auto-updater (vérifie GitHub Releases)
  initAutoUpdater(mainWindow)

  logger.info('Application ready', { service: 'MAIN' })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

// Cleanup running automations before quitting
let isCleaningUp = false
app.on('before-quit', async (event) => {
  if (isCleaningUp) return
  isCleaningUp = true
  event.preventDefault()
  logger.info('Application shutting down, cleaning up...', { service: 'MAIN' })
  try {
    await AutomationService.cleanupOnShutdown()
    logger.info('Cleanup completed', { service: 'MAIN' })
  } catch (e) {
    logger.error('Cleanup error during shutdown', { service: 'MAIN' }, e)
    captureException(e, { tags: { context: 'shutdown' } })
  }
  // Flush Sentry before exit
  await flushSentry()
  app.exit(0)
})

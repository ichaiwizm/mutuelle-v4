import 'dotenv/config'
import { app, BrowserWindow, Menu } from 'electron'

// Initialize Sentry as early as possible for crash reporting
import { initSentry, flushSentry, captureException } from './services/monitoring'
initSentry()

// Disable GPU for WSL2 compatibility
app.disableHardwareAcceleration()
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerIpc } from './ipc'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from './db'
import { flows, productStatus } from './db/schema'
import { PRODUCT_CONFIGS } from './flows/config/products'
import { AutomationService } from './services/automation'
import { initAutoUpdater } from './services/autoUpdater'
import { logger, initLogger } from './services/logger'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createWindow() {
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
  if (process.env.ELECTRON_RENDERER_URL) await win.loadURL(process.env.ELECTRON_RENDERER_URL)
  else await win.loadFile(path.join(__dirname, '../renderer/index.html'))

  // Open DevTools in development
  if (process.env.ELECTRON_RENDERER_URL) win.webContents.openDevTools()
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
  await createWindow()

  // Initialise l'auto-updater (vérifie GitHub Releases)
  initAutoUpdater()

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

import 'dotenv/config'
import { app, BrowserWindow, Menu } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { initSentry, flushSentry, captureException } from './services/monitoring'
initSentry()

process.on('uncaughtException', (error) => {
  console.error('[MAIN] Uncaught exception:', error)
  captureException(error, { tags: { context: 'uncaught-exception' } })
})

process.on('unhandledRejection', (reason) => {
  console.error('[MAIN] Unhandled rejection:', reason)
  captureException(reason, { tags: { context: 'unhandled-rejection' } })
})

app.disableHardwareAcceleration()

import { registerIpc } from './ipc'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from './db'
import { AutomationService } from './services/automation'
import { initAutoUpdater } from './services/autoUpdater'
import { logger, initLogger } from './services/logger'
import { patchMissingColumns } from './bootstrap/db-patch'
import { seedFlows, seedProductStatus } from './bootstrap/seeders'
import { createWindow } from './bootstrap/window'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.whenReady().then(async () => {
  initLogger()
  logger.info('Application starting', { service: 'MAIN' })

  try { Menu.setApplicationMenu(null) } catch {}

  const isDev = !!process.env.ELECTRON_RENDERER_URL
  const migrationsFolder = isDev
    ? path.join(__dirname, '../../drizzle')
    : path.join(process.resourcesPath, 'drizzle')
  await migrate(db, { migrationsFolder })

  patchMissingColumns()
  await seedFlows()
  await AutomationService.cleanupOrphanedRuns()
  await seedProductStatus()

  registerIpc()
  const mainWindow = await createWindow()
  initAutoUpdater(mainWindow)

  logger.info('Application ready', { service: 'MAIN' })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

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
  await flushSentry()
  app.exit(0)
})

import 'dotenv/config'
import { app, BrowserWindow, Menu } from 'electron'

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
  // Supprime le menu d'application (File/Edit/View...)
  try { Menu.setApplicationMenu(null) } catch {}
  // --- migrations runtime KISS ---
  const migrationsFolder = path.join(__dirname, '../../drizzle')
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
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

// Cleanup running automations before quitting
let isCleaningUp = false
app.on('before-quit', async (event) => {
  if (isCleaningUp) return
  isCleaningUp = true
  event.preventDefault()
  try {
    await AutomationService.cleanupOnShutdown()
  } catch (e) {
    console.error('[SHUTDOWN] Cleanup error:', e)
  }
  app.exit(0)
})

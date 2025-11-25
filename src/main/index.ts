import { app, BrowserWindow, Menu } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerIpc } from './ipc'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from './db'
import { flows } from './db/schema'

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
}

app.whenReady().then(async () => {
  // Supprime le menu d'application (File/Edit/View...)
  try { Menu.setApplicationMenu(null) } catch {}
  // --- migrations runtime KISS ---
  const migrationsFolder = path.join(__dirname, '../../drizzle')
  await migrate(db, { migrationsFolder })

  // --- seeder flows ---
  const [exists] = await db.select({ key: flows.key }).from(flows).limit(1)
  if (!exists) {
    await db.insert(flows).values([
      { key: 'swisslife_one_slsis', version: 'v1', title: 'SwissLife One SLSIS' },
    ])
  }

  registerIpc()
  await createWindow()
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

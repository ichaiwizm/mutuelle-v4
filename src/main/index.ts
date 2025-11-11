import { app, BrowserWindow } from 'electron'
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
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
    },
  })
  if (process.env.ELECTRON_RENDERER_URL) await win.loadURL(process.env.ELECTRON_RENDERER_URL)
  else await win.loadFile(path.join(__dirname, '../renderer/index.html'))
}

app.whenReady().then(async () => {
  // --- migrations runtime KISS ---
  const migrationsFolder = path.join(__dirname, '../../drizzle')
  await migrate(db, { migrationsFolder })

  // --- seeder flows ---
  const count = await db.select({ c: db.$count(flows) }).from(flows)
  if (!count[0]?.c) {
    await db.insert(flows).values([
      { key: 'alptis_sante_select', version: 'v1', title: 'Alptis Santé Select' },
      { key: 'swisslife_one_slis', version: 'v1', title: 'SwissLife One SLIS' },
    ])
  }

  registerIpc()
  await createWindow()
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

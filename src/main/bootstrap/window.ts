import { BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { logger } from '../services/logger'
import { captureException } from '../services/monitoring'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function createWindow(): Promise<BrowserWindow> {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../../preload/index.js'),
      contextIsolation: true,
    },
  })
  try { win.setMenuBarVisibility(false) } catch {}

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

  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') win.webContents.toggleDevTools()
  })

  if (process.env.ELECTRON_RENDERER_URL) await win.loadURL(process.env.ELECTRON_RENDERER_URL)
  else await win.loadFile(path.join(__dirname, '../../renderer/index.html'))

  if (process.env.ELECTRON_RENDERER_URL) win.webContents.openDevTools()

  return win
}

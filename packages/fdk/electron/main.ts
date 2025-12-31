import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { registerIpcHandlers, unregisterIpcHandlers } from '../src/main/ipc';
import { initializeCredentials } from '../src/main/db/credential-repository';

// Disable GPU for WSL2 compatibility (same as main app)
app.disableHardwareAcceleration();

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
    },
    show: false,
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const rendererUrl = process.env.ELECTRON_RENDERER_URL;
  if (rendererUrl) {
    console.log('[FDK] Loading dev server:', rendererUrl);
    mainWindow.loadURL(rendererUrl);
    mainWindow.webContents.openDevTools();
  } else {
    const htmlPath = join(__dirname, '../renderer/index.html');
    console.log('[FDK] Loading file:', htmlPath);
    mainWindow.loadFile(htmlPath);
  }
}

// Setup error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.whenReady().then(() => {
  console.log('[FDK] App ready, registering handlers...');

  try {
    registerIpcHandlers();
    console.log('[FDK] IPC handlers registered');

    // Initialize default credentials for development
    initializeCredentials();
    console.log('[FDK] Credentials initialized');
  } catch (err) {
    console.error('[FDK] Failed to register IPC handlers:', err);
  }

  console.log('[FDK] Creating window...');
  createWindow();
  console.log('[FDK] Window created');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Cleanup IPC handlers on app quit
  unregisterIpcHandlers();
});

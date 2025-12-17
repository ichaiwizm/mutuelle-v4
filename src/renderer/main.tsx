import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import { ThemeProvider } from './components/layout/ThemeProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { initSentryRenderer } from './services/sentry'
import './styles.css'

// Initialize Sentry for renderer process
initSentryRenderer()

// Global error handlers for uncaught errors
window.onerror = (message, source, lineno, colno, error) => {
  console.error('[GLOBAL ERROR]', { message, source, lineno, colno, error })
}

window.onunhandledrejection = (event) => {
  console.error('[UNHANDLED REJECTION]', event.reason)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <App />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              },
            }}
          />
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)

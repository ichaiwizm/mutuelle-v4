import { Component, ReactNode } from 'react'
import { captureException } from '../services/sentry'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    captureException(error, {
      tags: { context: 'react-error-boundary' },
      extra: { componentStack: errorInfo.componentStack },
    })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="max-w-md rounded-lg border border-border bg-surface p-8 text-center">
            <div className="mb-4 text-4xl">
              <span role="img" aria-label="error">&#9888;</span>
            </div>
            <h1 className="mb-2 text-xl font-semibold text-text-primary">
              Une erreur est survenue
            </h1>
            <p className="mb-4 text-sm text-text-secondary">
              L'application a rencontré un problème inattendu.
            </p>
            {this.state.error && (
              <pre className="mb-4 overflow-auto rounded bg-background p-2 text-left text-xs text-red-400">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Recharger l'application
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

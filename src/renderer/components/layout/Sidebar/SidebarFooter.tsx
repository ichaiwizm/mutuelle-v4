import { useState } from 'react'
import { Mail, Moon, Sun, CheckCircle2, XCircle, Loader2, LogOut, ChevronUp } from 'lucide-react'
import { useTheme } from '../ThemeProvider'
import { Button } from '../../ui/Button'
import { useMailConnection } from '@/renderer/hooks'
import { cn } from '@/lib/utils'

interface SidebarFooterProps {
  mailStatus?: { ok: boolean; email?: string }
  onMailStatusChange?: () => void
}

export function SidebarFooter({ mailStatus, onMailStatusChange }: SidebarFooterProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)

  const { isConnecting, handleConnect, handleDisconnect, handleCancelConnect } = useMailConnection({
    onSuccess: onMailStatusChange,
  })

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const isConnected = mailStatus?.ok

  return (
    <div className="border-t border-[var(--color-border)] p-3 space-y-3">
      {/* Gmail Connection Widget */}
      <div className="relative">
        <div
          onClick={() => !isConnecting && setIsExpanded(!isExpanded)}
          className={cn(
            'w-full flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2',
            'transition-all duration-150 ease-out',
            !isConnecting && 'cursor-pointer hover:bg-[var(--color-surface-hover)]',
            isExpanded && !isConnecting && 'bg-[var(--color-surface-hover)]'
          )}
        >
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full',
            'transition-colors duration-200',
            isConnecting ? 'bg-[var(--color-info-muted)]' :
            isConnected ? 'bg-[var(--color-success-muted)]' : 'bg-[var(--color-surface)]'
          )}>
            {isConnecting ? (
              <Loader2 className="h-4 w-4 text-[var(--color-info)] animate-spin" />
            ) : (
              <Mail className={cn(
                'h-4 w-4 transition-colors duration-200',
                isConnected ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'
              )} />
            )}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs text-[var(--color-text-muted)]">Gmail</p>
            {isConnecting ? (
              <p className="text-xs font-medium text-[var(--color-info)]">
                Connexion...
              </p>
            ) : isConnected ? (
              <p className="truncate text-xs font-medium text-[var(--color-text-secondary)]">
                {mailStatus.email}
              </p>
            ) : (
              <p className="text-xs text-[var(--color-text-muted)]">Non connect&#233;</p>
            )}
          </div>

          {isConnecting ? (
            <button
              onClick={handleCancelConnect}
              className="p-1.5 rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-error-muted)] transition-colors group"
            >
              <XCircle className="h-4 w-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-error)]" />
            </button>
          ) : isConnected ? (
            <CheckCircle2 className={cn(
              'h-4 w-4 text-[var(--color-success)]',
              'transition-transform duration-300 ease-out',
              'animate-in zoom-in-50'
            )} />
          ) : (
            <ChevronUp className={cn(
              'h-4 w-4 text-[var(--color-text-muted)]',
              'transition-transform duration-150',
              isExpanded ? 'rotate-180' : 'rotate-0'
            )} />
          )}
        </div>

        {/* Action Panel */}
        <div className={cn(
          'overflow-hidden transition-all duration-150 ease-out',
          isExpanded && !isConnecting ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'
        )}>
          <div className="flex gap-2 px-1">
            {isConnected ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="flex-1 text-xs gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                D&#233;connecter
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsExpanded(false)
                  handleConnect()
                }}
                className="flex-1 text-xs"
              >
                Connecter Gmail
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-full justify-start">
        {resolvedTheme === 'dark' ? (
          <>
            <Sun className="h-4 w-4" />
            <span>Light mode</span>
          </>
        ) : (
          <>
            <Moon className="h-4 w-4" />
            <span>Dark mode</span>
          </>
        )}
      </Button>
    </div>
  )
}

import { useState } from 'react'
import { CheckCircle2, XCircle, LogOut, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../../ui/Button'
import { useMailConnection } from '@/renderer/hooks'
import { GmailStatusIcon } from './GmailStatusIcon'

interface GmailConnectionWidgetProps {
  mailStatus?: { ok: boolean; email?: string }
  onMailStatusChange?: () => void
}

export function GmailConnectionWidget({ mailStatus, onMailStatusChange }: GmailConnectionWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { isConnecting, handleConnect, handleDisconnect, handleCancelConnect } = useMailConnection({ onSuccess: onMailStatusChange })
  const isConnected = mailStatus?.ok

  const handleToggle = () => !isConnecting && setIsExpanded(!isExpanded)

  return (
    <div className="relative">
      <div onClick={handleToggle} className={cn('w-full flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 transition-all duration-150 ease-out', !isConnecting && 'cursor-pointer hover:bg-[var(--color-surface-hover)]', isExpanded && !isConnecting && 'bg-[var(--color-surface-hover)]')}>
        <GmailStatusIcon isConnecting={isConnecting} isConnected={!!isConnected} />

        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs text-[var(--color-text-muted)]">Gmail</p>
          {isConnecting ? <p className="text-xs font-medium text-[var(--color-info)]">Connexion...</p> : isConnected ? <p className="truncate text-xs font-medium text-[var(--color-text-secondary)]">{mailStatus?.email}</p> : <p className="text-xs text-[var(--color-text-muted)]">Non connecté</p>}
        </div>

        {isConnecting ? (
          <button onClick={handleCancelConnect} className="p-1.5 rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-error-muted)] transition-colors group">
            <XCircle className="h-4 w-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-error)]" />
          </button>
        ) : isConnected ? (
          <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] animate-in zoom-in-50" />
        ) : (
          <ChevronUp className={cn('h-4 w-4 text-[var(--color-text-muted)] transition-transform duration-150', isExpanded ? 'rotate-180' : 'rotate-0')} />
        )}
      </div>

      <div className={cn('overflow-hidden transition-all duration-150 ease-out', isExpanded && !isConnecting ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0')}>
        <div className="flex gap-2 px-1">
          {isConnected ? (
            <Button variant="ghost" size="sm" onClick={handleDisconnect} className="flex-1 text-xs gap-1.5"><LogOut className="h-3.5 w-3.5" />Déconnecter</Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => { setIsExpanded(false); handleConnect() }} className="flex-1 text-xs">Connecter Gmail</Button>
          )}
        </div>
      </div>
    </div>
  )
}

import { Mail, X, Loader2 } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/renderer/components/ui'
import { cn } from '@/lib/utils'

interface GmailStatusCardProps {
  isConnected: boolean
  email?: string
  isConnecting: boolean
  onConnect: () => void
  onDisconnect: () => void
  onCancelConnect: () => void
}

export function GmailStatusCard({
  isConnected, email, isConnecting, onConnect, onDisconnect, onCancelConnect,
}: GmailStatusCardProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Gmail</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            isConnecting ? 'bg-[var(--color-info-muted)]'
              : isConnected ? 'bg-[var(--color-success-muted)]' : 'bg-[var(--color-surface-hover)]'
          )}>
            {isConnecting ? (
              <Loader2 className="h-5 w-5 text-[var(--color-info)] animate-spin" />
            ) : (
              <Mail className={cn('h-5 w-5', isConnected ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]')} />
            )}
          </div>
          <div className="flex-1">
            {isConnecting ? (
              <><p className="text-sm font-medium">Connecting...</p><p className="text-xs text-[var(--color-text-muted)]">Complete auth in browser</p></>
            ) : isConnected ? (
              <><p className="text-sm font-medium">{email}</p><p className="text-xs text-[var(--color-text-muted)]">Connected</p></>
            ) : (
              <><p className="text-sm font-medium">Not connected</p><p className="text-xs text-[var(--color-text-muted)]">Connect to fetch leads</p></>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isConnecting && <Button variant="ghost" size="sm" onClick={onCancelConnect}><X className="h-4 w-4" /></Button>}
            <Button
              variant={isConnected ? 'ghost' : 'primary'}
              size="sm"
              onClick={isConnected ? onDisconnect : onConnect}
              disabled={isConnecting}
            >
              {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : isConnected ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

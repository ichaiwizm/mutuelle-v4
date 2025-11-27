import { Mail, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GmailStatusIconProps {
  isConnecting: boolean
  isConnected: boolean
}

export function GmailStatusIcon({ isConnecting, isConnected }: GmailStatusIconProps) {
  return (
    <div
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200',
        isConnecting ? 'bg-[var(--color-info-muted)]' : isConnected ? 'bg-[var(--color-success-muted)]' : 'bg-[var(--color-surface)]'
      )}
    >
      {isConnecting ? (
        <Loader2 className="h-4 w-4 text-[var(--color-info)] animate-spin" />
      ) : (
        <Mail className={cn('h-4 w-4 transition-colors duration-200', isConnected ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]')} />
      )}
    </div>
  )
}

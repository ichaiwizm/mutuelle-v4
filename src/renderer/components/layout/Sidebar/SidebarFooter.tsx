import { Mail, Moon, Sun, CheckCircle2, XCircle } from 'lucide-react'
import { useTheme } from '../ThemeProvider'
import { Button } from '../../ui/Button'

interface SidebarFooterProps {
  mailStatus?: { ok: boolean; email?: string }
}

export function SidebarFooter({ mailStatus }: SidebarFooterProps) {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="border-t border-[var(--color-border)] p-3 space-y-3">
      {/* Gmail Status */}
      <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-background)] px-3 py-2">
        <Mail className="h-4 w-4 text-[var(--color-text-muted)]" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--color-text-muted)]">Gmail</p>
          {mailStatus?.ok ? (
            <p className="truncate text-xs font-medium text-[var(--color-text-secondary)]">
              {mailStatus.email}
            </p>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)]">Non connecté</p>
          )}
        </div>
        {mailStatus?.ok ? (
          <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
        ) : (
          <XCircle className="h-4 w-4 text-[var(--color-text-muted)]" />
        )}
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

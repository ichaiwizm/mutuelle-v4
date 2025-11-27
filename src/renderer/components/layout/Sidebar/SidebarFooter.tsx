import { GmailConnectionWidget } from './GmailConnectionWidget'
import { ThemeToggle } from './ThemeToggle'

interface SidebarFooterProps {
  mailStatus?: { ok: boolean; email?: string }
  onMailStatusChange?: () => void
}

export function SidebarFooter({ mailStatus, onMailStatusChange }: SidebarFooterProps) {
  return (
    <div className="border-t border-[var(--color-border)] p-3 space-y-3">
      <GmailConnectionWidget mailStatus={mailStatus} onMailStatusChange={onMailStatusChange} />
      <ThemeToggle />
    </div>
  )
}

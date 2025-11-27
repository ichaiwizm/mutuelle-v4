import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Zap,
  Settings,
  Mail,
  Moon,
  Sun,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from './ThemeProvider'
import { Button } from '../ui/Button'

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
}

function NavItem({ to, icon, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors duration-[var(--transition-fast)]',
          isActive
            ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

interface SidebarProps {
  mailStatus?: { ok: boolean; email?: string }
}

export function Sidebar({ mailStatus }: SidebarProps) {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-[var(--color-border)] px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]">
          <span className="text-sm font-bold text-white">M</span>
        </div>
        <span className="font-semibold">Mutuelles</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        <NavItem
          to="/"
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Dashboard"
        />
        <NavItem
          to="/leads"
          icon={<Users className="h-4 w-4" />}
          label="Leads"
        />
        <NavItem
          to="/automation"
          icon={<Zap className="h-4 w-4" />}
          label="Automation"
        />
        <NavItem
          to="/config"
          icon={<Settings className="h-4 w-4" />}
          label="Configuration"
        />
      </nav>

      {/* Footer */}
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
              <p className="text-xs text-[var(--color-text-muted)]">
                Non connecté
              </p>
            )}
          </div>
          {mailStatus?.ok ? (
            <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
          ) : (
            <XCircle className="h-4 w-4 text-[var(--color-text-muted)]" />
          )}
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-full justify-start"
        >
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
    </aside>
  )
}

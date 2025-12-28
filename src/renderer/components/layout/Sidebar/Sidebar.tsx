import { LayoutDashboard, Users, FileText, Zap, Settings } from 'lucide-react'
import { SidebarHeader } from './SidebarHeader'
import { SidebarFooter } from './SidebarFooter'
import { NavItem } from './NavItem'

interface SidebarProps {
  mailStatus?: { ok: boolean; email?: string }
  onMailStatusChange?: () => void
}

export function Sidebar({ mailStatus, onMailStatusChange }: SidebarProps) {
  return (
    <aside className="flex h-screen w-56 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <SidebarHeader />

      <nav className="flex-1 space-y-1 p-3">
        <NavItem to="/" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
        <NavItem to="/leads" icon={<Users className="h-4 w-4" />} label="Leads" />
        <NavItem to="/devis" icon={<FileText className="h-4 w-4" />} label="Devis" />
        <NavItem to="/automation" icon={<Zap className="h-4 w-4" />} label="Automation" />
        <NavItem to="/config" icon={<Settings className="h-4 w-4" />} label="Configuration" />
      </nav>

      <SidebarFooter mailStatus={mailStatus} onMailStatusChange={onMailStatusChange} />
    </aside>
  )
}

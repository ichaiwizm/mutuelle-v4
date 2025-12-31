/**
 * Sidebar Navigation
 * Terminal-style navigation with cyan accents
 */
import { NavItem } from './sidebar/NavItem';
import { icons } from './sidebar/SidebarIcons';
import { SidebarHeader } from './sidebar/SidebarHeader';

export function Sidebar() {
  return (
    <aside
      className="w-64 flex flex-col border-r"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <SidebarHeader />

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <NavItem to="/" icon={icons.dashboard} label="Dashboard" end />
        <NavItem to="/flows" icon={icons.flows} label="Flows" />
        <NavItem to="/leads" icon={icons.leads} label="Leads" />
        <NavItem to="/run" icon={icons.run} label="Run Flow" />
        <NavItem to="/history" icon={icons.history} label="History" />
      </nav>

      <div className="p-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <NavItem to="/settings" icon={icons.settings} label="Settings" />
      </div>
    </aside>
  );
}

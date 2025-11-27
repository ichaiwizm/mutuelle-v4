import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useDashboard } from '@/renderer/hooks/useDashboard'

export function Layout() {
  const { data } = useDashboard()

  return (
    <div className="flex h-screen bg-[var(--color-background)]">
      <Sidebar mailStatus={data?.mail} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

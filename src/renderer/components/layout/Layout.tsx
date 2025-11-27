import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useDashboardContext } from '@/renderer/contexts/DashboardContext'

export function Layout() {
  const { data, refetch } = useDashboardContext()

  return (
    <div className="flex h-screen bg-[var(--color-background)]">
      <Sidebar mailStatus={data?.mail} onMailStatusChange={refetch} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

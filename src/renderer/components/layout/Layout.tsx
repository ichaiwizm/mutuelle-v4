import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useDashboard } from '@/renderer/hooks'

export function Layout() {
  const { data, refetch } = useDashboard()

  return (
    <div className="flex h-screen bg-[var(--color-background)]">
      <Sidebar mailStatus={data?.mail} onMailStatusChange={refetch} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

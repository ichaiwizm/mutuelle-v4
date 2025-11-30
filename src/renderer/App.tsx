import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { LeadsPage } from './pages/LeadsPage'
import { AutomationPage } from './pages/AutomationPage'
import { DashboardProvider } from './contexts/DashboardContext'

// Placeholder page - will be implemented later
function ConfigPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Configuration</h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">Coming soon...</p>
    </div>
  )
}

export default function App() {
  return (
    <DashboardProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="automation" element={<AutomationPage />} />
          <Route path="config" element={<ConfigPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DashboardProvider>
  )
}

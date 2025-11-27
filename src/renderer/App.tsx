import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { DashboardPage } from './pages/DashboardPage'

// Placeholder pages - will be implemented later
function LeadsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Leads</h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">Coming soon...</p>
    </div>
  )
}

function AutomationPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Automation</h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">Coming soon...</p>
    </div>
  )
}

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
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="automation" element={<AutomationPage />} />
        <Route path="config" element={<ConfigPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

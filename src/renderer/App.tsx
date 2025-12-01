import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { LeadsPage } from './pages/LeadsPage'
import { AutomationPage } from './pages/AutomationPage'
import { RunLivePage } from './pages/RunLivePage'
import { ConfigPage } from './pages/ConfigPage'
import { DashboardProvider } from './contexts/DashboardContext'

export default function App() {
  return (
    <DashboardProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="automation" element={<AutomationPage />} />
          <Route path="automation/runs/:runId" element={<RunLivePage />} />
          <Route path="config" element={<ConfigPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DashboardProvider>
  )
}

import { useState } from 'react'
import Dashboard from "./pages/Dashboard/Dashboard"
import ConfigPage from "./pages/Config/ConfigPage"
import LeadsPage from "./pages/Leads/LeadsPage"
import AutomationPage from "./pages/Automation/AutomationPage"

type Tab = 'dashboard'|'config'|'leads'|'automation'

export default function App(){
  const [tab, setTab] = useState<Tab>('dashboard')
  const Nav = (t:Tab, l:string) => (
    <button
      className={`px-3 py-2 rounded ${tab===t?'bg-foreground text-background':'border'}`}
      onClick={() => setTab(t)}
    >
      {l}
    </button>
  )
  return (
    <div className="h-screen flex flex-col">
      <header className="p-3 border-b bg-background flex gap-2">
        {Nav('dashboard','Dashboard')}
        {Nav('config','Config')}
        {Nav('leads','Leads')}
        {Nav('automation','Automatisation')}
      </header>
      <main className="flex-1 overflow-auto p-6">
        {tab==='dashboard' && <Dashboard/>}
        {tab==='config' && <ConfigPage/>}
        {tab==='leads' && <LeadsPage/>}
        {tab==='automation' && <AutomationPage/>}
      </main>
    </div>
  )
}

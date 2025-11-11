import { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "components/ui/card"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import type { Flow } from "@/shared/types/flow"
export default function ConfigPage(){
  const [flows, setFlows] = useState<Flow[]>([])
  const [alptisLogin, setAlptisLogin] = useState("")
  const [alptisPass, setAlptisPass] = useState("")
  const [alptisStatus, setAlptisStatus] = useState<string>("")
  const [slLogin, setSlLogin] = useState("")
  const [slPass, setSlPass] = useState("")
  const [slStatus, setSlStatus] = useState<string>("")

  useEffect(() => {
    // Charge le catalogue depuis la DB via IPC
    window.api.flows.list().then(setFlows).catch(console.error)
  }, [])

  async function saveAlptis(){
    await window.api.credentials.upsert({ platform: 'alptis', login: alptisLogin, password: alptisPass })
    setAlptisStatus('Enregistré')
  }
  async function testAlptis(){
    const res = await window.api.credentials.test('alptis')
    setAlptisStatus(res.ok ? 'OK' : `Erreur${res.message ? ': '+res.message : ''}`)
  }

  async function saveSwissLife(){
    await window.api.credentials.upsert({ platform: 'swisslife', login: slLogin, password: slPass })
    setSlStatus('Enregistré')
  }
  async function testSwissLife(){
    const res = await window.api.credentials.test('swisslife')
    setSlStatus(res.ok ? 'OK' : `Erreur${res.message ? ': '+res.message : ''}`)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="catalogue">
        <TabsList>
          <TabsTrigger value="catalogue">Catalogue de flows</TabsTrigger>
          <TabsTrigger value="credentials">Identifiants</TabsTrigger>
        </TabsList>

        <TabsContent value="catalogue" className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {flows.map(f => (
              <Card key={f.key} className="hover:shadow-sm transition">
                <CardHeader>
                  <CardTitle className="text-base">
                    {f.title} <span className="text-xs text-muted-foreground">({f.key})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-muted-foreground">Version {f.version}</div>
                  <Button size="sm">Voir détails</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="credentials" className="pt-4">
          <div className="max-w-md space-y-3">
            <div className="space-y-2">
              <Label htmlFor="alptis-login">Alptis – Identifiant</Label>
              <Input id="alptis-login" placeholder="ex: courtier@exemple.com" value={alptisLogin} onChange={e=>setAlptisLogin(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alptis-pass">Alptis – Mot de passe</Label>
              <Input id="alptis-pass" type="password" value={alptisPass} onChange={e=>setAlptisPass(e.target.value)} />
            </div>
            <div className="space-x-2">
              <Button size="sm" onClick={saveAlptis}>Enregistrer</Button>
              <Button size="sm" variant="outline" onClick={testAlptis}>Tester la connexion</Button>
            </div>
            {alptisStatus && <div className="text-xs text-muted-foreground">{alptisStatus}</div>}
            <hr className="my-3 border" />
            <div className="space-y-2">
              <Label htmlFor="slone-login">SwissLife One – Identifiant</Label>
              <Input id="slone-login" placeholder="ex: agent@exemple.com" value={slLogin} onChange={e=>setSlLogin(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slone-pass">SwissLife One – Mot de passe</Label>
              <Input id="slone-pass" type="password" value={slPass} onChange={e=>setSlPass(e.target.value)} />
            </div>
            <div className="space-x-2">
              <Button size="sm" onClick={saveSwissLife}>Enregistrer</Button>
              <Button size="sm" variant="outline" onClick={testSwissLife}>Tester la connexion</Button>
            </div>
            {slStatus && <div className="text-xs text-muted-foreground">{slStatus}</div>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

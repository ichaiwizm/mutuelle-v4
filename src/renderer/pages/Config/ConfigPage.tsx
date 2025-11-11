import { Tabs, TabsList, TabsTrigger, TabsContent } from "components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "components/ui/card"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"

export default function ConfigPage(){
  return (
    <div className="space-y-6">
      <Tabs defaultValue="catalogue">
        <TabsList>
          <TabsTrigger value="catalogue">Catalogue de flows</TabsTrigger>
          <TabsTrigger value="credentials">Identifiants</TabsTrigger>
        </TabsList>

        <TabsContent value="catalogue" className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {["alptis_sante_select","alptis_sante_select_pro","swisslife_one_slis"].map(k => (
              <Card key={k} className="hover:shadow-sm transition">
                <CardHeader><CardTitle className="text-base">{k}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-muted-foreground">Description courte…</div>
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
              <Input id="alptis-login" placeholder="ex: courtier@exemple.com"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alptis-pass">Alptis – Mot de passe</Label>
              <Input id="alptis-pass" type="password" />
            </div>
            <div className="space-x-2">
              <Button size="sm">Enregistrer</Button>
              <Button size="sm" variant="outline">Tester la connexion</Button>
            </div>
            <hr className="my-3 border" />
            <div className="space-y-2">
              <Label htmlFor="slone-login">SwissLife One – Identifiant</Label>
              <Input id="slone-login" placeholder="ex: agent@exemple.com"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slone-pass">SwissLife One – Mot de passe</Label>
              <Input id="slone-pass" type="password" />
            </div>
            <div className="space-x-2">
              <Button size="sm">Enregistrer</Button>
              <Button size="sm" variant="outline">Tester la connexion</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

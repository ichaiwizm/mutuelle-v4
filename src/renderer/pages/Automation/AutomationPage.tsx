import { Card, CardHeader, CardTitle, CardContent } from "components/ui/card"

export default function AutomationPage(){
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres run</CardTitle>
        </CardHeader>
        <CardContent>headless / minimisé / normal, parallélisme…</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Queue</CardTitle>
        </CardHeader>
        <CardContent>multi-leads × multi-flows</CardContent>
      </Card>
    </div>
  )
}

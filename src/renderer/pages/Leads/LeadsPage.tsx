import { Button } from "components/ui/button"

export default function LeadsPage(){
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm">+ Ajouter</Button>
        <Button size="sm" variant="outline">Coller (intelligent)</Button>
        <Button size="sm" variant="outline">Bulk Gmail</Button>
      </div>
      <div className="border rounded-lg p-4 text-sm text-muted-foreground">
        Liste des leads (CRUD modal) – à venir
      </div>
    </div>
  )
}

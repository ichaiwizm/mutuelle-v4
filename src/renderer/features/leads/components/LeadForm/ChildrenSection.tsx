import { Plus, Trash2 } from 'lucide-react'
import { Input, Label, Button } from '@/renderer/components/ui'
import { frenchToISO } from '@/renderer/lib/dateUtils'
import type { Child } from '@/shared/types/lead'

interface ChildrenSectionProps {
  children: Child[]
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, field: keyof Child, value: string) => void
}

export function ChildrenSection({ children, onAdd, onRemove, onUpdate }: ChildrenSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Children ({children.length})
        </h3>
        <Button type="button" variant="ghost" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add Child
        </Button>
      </div>

      {children.map((child, index) => (
        <div
          key={index}
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Child {child.order || index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="h-8 w-8 p-0 text-[var(--color-error)]"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <Label>Birthday</Label>
            <Input
              type="date"
              value={frenchToISO(child.dateNaissance) || ''}
              onChange={(e) => onUpdate(index, 'dateNaissance', e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

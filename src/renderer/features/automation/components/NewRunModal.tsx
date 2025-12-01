import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Play, Package, Users, Loader2, ChevronDown, Clock } from 'lucide-react'
import { Modal } from '@/renderer/components/ui/Modal/Modal'
import { ModalHeader } from '@/renderer/components/ui/Modal/ModalHeader'
import { Button } from '@/renderer/components/ui/Button'
import { Card } from '@/renderer/components/ui/Card'
import { SearchInput } from '@/renderer/components/ui/SearchInput'
import { Skeleton } from '@/renderer/components/ui/Skeleton'
import type { ProductConfiguration } from '@/shared/types/product'
import type { Lead } from '@/shared/types/lead'

/**
 * Format duration in human-readable format
 */
function formatEstimatedTime(ms: number): string {
  if (ms < 60000) return '< 1 min'
  const minutes = Math.ceil(ms / 60000)
  if (minutes < 60) return `~${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) return `~${hours}h`
  return `~${hours}h ${remainingMinutes}min`
}

interface NewRunModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function NewRunModal({ isOpen, onClose, onSuccess }: NewRunModalProps) {
  const navigate = useNavigate()

  // Data state
  const [products, setProducts] = useState<ProductConfiguration[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingLeads, setLoadingLeads] = useState(true)

  // Selection state
  const [selectedFlows, setSelectedFlows] = useState<Set<string>>(new Set())
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Submission state
  const [submitting, setSubmitting] = useState(false)

  // Fetch products when modal opens
  useEffect(() => {
    if (!isOpen) return

    // Reset state when opening
    setSelectedFlows(new Set())
    setSelectedLeads(new Set())
    setSearchQuery('')

    // Fetch active products
    setLoadingProducts(true)
    window.api.products
      .listActiveConfigs()
      .then((configs) => {
        setProducts(configs)
      })
      .catch((error) => {
        console.error('Failed to fetch products:', error)
        toast.error('Erreur lors du chargement des produits')
      })
      .finally(() => setLoadingProducts(false))
  }, [isOpen])

  // Fetch leads with server-side search (debounced)
  useEffect(() => {
    if (!isOpen) return

    setLoadingLeads(true)
    const timeoutId = setTimeout(() => {
      window.api.leads
        .list({ limit: 500, offset: 0, search: searchQuery || undefined })
        .then((result) => {
          // Parse lead data from JSON string
          const parsedLeads = result.leads.map((row) => ({
            id: row.id,
            ...JSON.parse(row.data),
          })) as Lead[]
          setLeads(parsedLeads)
        })
        .catch((error) => {
          console.error('Failed to fetch leads:', error)
          toast.error('Erreur lors du chargement des leads')
        })
        .finally(() => setLoadingLeads(false))
    }, searchQuery ? 300 : 0) // Debounce only when searching

    return () => clearTimeout(timeoutId)
  }, [isOpen, searchQuery])

  // Leads are already filtered server-side
  const filteredLeads = leads

  // Toggle flow selection
  const toggleFlow = useCallback((flowKey: string) => {
    setSelectedFlows((prev) => {
      const next = new Set(prev)
      if (next.has(flowKey)) {
        next.delete(flowKey)
      } else {
        next.add(flowKey)
      }
      return next
    })
  }, [])

  // Toggle lead selection
  const toggleLead = useCallback((leadId: string) => {
    setSelectedLeads((prev) => {
      const next = new Set(prev)
      if (next.has(leadId)) {
        next.delete(leadId)
      } else {
        next.add(leadId)
      }
      return next
    })
  }, [])

  // Select/deselect all flows
  const toggleAllFlows = useCallback(() => {
    if (selectedFlows.size === products.length) {
      setSelectedFlows(new Set())
    } else {
      setSelectedFlows(new Set(products.map((p) => p.flowKey)))
    }
  }, [products, selectedFlows.size])

  // Select/deselect all visible leads
  const toggleAllLeads = useCallback(() => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(filteredLeads.map((l) => l.id)))
    }
  }, [filteredLeads, selectedLeads.size])

  // Quick select last N leads
  const selectLastN = useCallback((n: number) => {
    const lastN = filteredLeads.slice(0, n).map((l) => l.id)
    setSelectedLeads(new Set(lastN))
  }, [filteredLeads])

  // Calculate total tasks
  const totalTasks = selectedFlows.size * selectedLeads.size
  const canSubmit = selectedFlows.size > 0 && selectedLeads.size > 0 && !submitting

  // Calculate estimated duration
  const estimatedDuration = useMemo(() => {
    if (selectedFlows.size === 0 || selectedLeads.size === 0) return 0

    // Get average duration per product
    const selectedProducts = products.filter((p) => selectedFlows.has(p.flowKey))
    const avgDurationPerTask = selectedProducts.reduce((acc, p) => {
      // Use metadata.estimatedTotalDuration if available, otherwise default to 60s
      const duration = p.metadata?.estimatedTotalDuration ?? 60000
      return acc + duration
    }, 0) / (selectedProducts.length || 1)

    // Calculate total with parallelism factor (3 concurrent tasks)
    const parallelFactor = 3
    const totalDuration = (totalTasks * avgDurationPerTask) / parallelFactor

    return totalDuration
  }, [products, selectedFlows, selectedLeads.size, totalTasks])

  // Quick select options
  const quickSelectOptions = useMemo(() => {
    const options = []
    if (filteredLeads.length >= 10) options.push(10)
    if (filteredLeads.length >= 50) options.push(50)
    if (filteredLeads.length >= 100) options.push(100)
    return options
  }, [filteredLeads.length])

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return

    setSubmitting(true)

    try {
      // Generate matrix of flowKey × leadId
      const items: Array<{ flowKey: string; leadId: string }> = []
      for (const flowKey of selectedFlows) {
        for (const leadId of selectedLeads) {
          items.push({ flowKey, leadId })
        }
      }

      const result = await window.api.automation.enqueue(items)
      toast.success(`${items.length} tâche${items.length > 1 ? 's' : ''} lancée${items.length > 1 ? 's' : ''}`)
      onSuccess()
      onClose()

      // Navigate to live view
      navigate(`/automation/runs/${result.runId}`)
    } catch (error) {
      console.error('Failed to enqueue automation:', error)
      toast.error("Erreur lors du lancement de l'automation")
    } finally {
      setSubmitting(false)
    }
  }, [canSubmit, selectedFlows, selectedLeads, onSuccess, onClose, navigate])

  // Get lead display name
  const getLeadDisplayName = (lead: Lead) => {
    const nom = lead.subscriber?.nom ?? ''
    const prenom = lead.subscriber?.prenom ?? ''
    return `${prenom} ${nom}`.trim() || 'Lead sans nom'
  }

  // Get lead subtitle
  const getLeadSubtitle = (lead: Lead) => {
    const dateNaissance = lead.subscriber?.dateNaissance ?? ''
    const codePostal = lead.subscriber?.codePostal ?? ''
    return [dateNaissance, codePostal].filter(Boolean).join(' - ')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <ModalHeader title="Nouvelle Automation" onClose={onClose} />

      <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
        {/* Products Section */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[var(--color-primary)]" />
              <h3 className="font-semibold text-[var(--color-text-primary)]">Produits</h3>
              <span className="text-sm text-[var(--color-text-muted)]">
                ({selectedFlows.size} sélectionné{selectedFlows.size > 1 ? 's' : ''})
              </span>
            </div>
            {products.length > 0 && (
              <button
                type="button"
                onClick={toggleAllFlows}
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                {selectedFlows.size === products.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
            )}
          </div>

          {loadingProducts ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
              Aucun produit actif disponible
            </p>
          ) : (
            <div className="space-y-2">
              {products.map((product) => (
                <label
                  key={product.flowKey}
                  className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedFlows.has(product.flowKey)}
                    onChange={() => toggleFlow(product.flowKey)}
                    className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] focus:ring-offset-0"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[var(--color-text-primary)]">
                      {product.displayName}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {product.platform} - {product.category}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </Card>

        {/* Leads Section */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[var(--color-primary)]" />
              <h3 className="font-semibold text-[var(--color-text-primary)]">Leads</h3>
              <span className="text-sm text-[var(--color-text-muted)]">
                ({selectedLeads.size} sélectionné{selectedLeads.size > 1 ? 's' : ''})
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Quick select dropdown */}
              {quickSelectOptions.length > 0 && (
                <div className="relative group">
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] px-2 py-1 rounded-md hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    Sélection rapide
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[140px]">
                    {quickSelectOptions.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => selectLastN(n)}
                        className="w-full px-3 py-1.5 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        {n} derniers
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {filteredLeads.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAllLeads}
                  className="text-sm text-[var(--color-primary)] hover:underline"
                >
                  {selectedLeads.size === filteredLeads.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <SearchInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="Rechercher un lead..."
            className="mb-4"
          />

          {loadingLeads ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : leads.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
              Aucun lead disponible
            </p>
          ) : filteredLeads.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
              Aucun lead trouvé pour "{searchQuery}"
            </p>
          ) : (
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {filteredLeads.map((lead) => (
                <label
                  key={lead.id}
                  className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedLeads.has(lead.id)}
                    onChange={() => toggleLead(lead.id)}
                    className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] focus:ring-offset-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[var(--color-text-primary)] truncate">
                      {getLeadDisplayName(lead)}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] truncate">
                      {getLeadSubtitle(lead)}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </Card>

        {/* Summary */}
        {(selectedFlows.size > 0 || selectedLeads.size > 0) && (
          <Card className="p-4 bg-[var(--color-surface-alt)]">
            <div className="flex items-center justify-center gap-4">
              <span className="text-lg font-semibold text-[var(--color-text-primary)]">
                {selectedFlows.size} produit{selectedFlows.size > 1 ? 's' : ''} × {selectedLeads.size} lead
                {selectedLeads.size > 1 ? 's' : ''} ={' '}
                <span className="text-[var(--color-primary)]">
                  {totalTasks} tâche{totalTasks > 1 ? 's' : ''}
                </span>
              </span>
              {/* Estimated duration */}
              {estimatedDuration > 0 && (
                <>
                  <div className="w-px h-6 bg-[var(--color-border)]" />
                  <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{formatEstimatedTime(estimatedDuration)}</span>
                  </div>
                </>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Lancement...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Lancer {totalTasks > 0 ? `${totalTasks} tâche${totalTasks > 1 ? 's' : ''}` : ''}
            </>
          )}
        </Button>
      </div>
    </Modal>
  )
}

import type { Run, RunItem } from '@/shared/types/run'
import type { ProductConfiguration } from '@/shared/types/product'
import type { FlowStateDTO } from '@/shared/ipc/contracts'

export type RunStatus = 'queued' | 'running' | 'done' | 'failed' | 'cancelled'

export interface RunWithItems extends Run {
  items: RunItem[]
}

export interface AutomationStats {
  queued: number
  running: number
  done: number
  failed: number
  cancelled: number
  paused: number
}

export interface RunFilters {
  status: RunStatus | 'all'
  productKey: string | 'all'
  search: string
}

export interface PausedFlowWithLead extends FlowStateDTO {
  leadName?: string
  productName?: string
  totalSteps?: number
}

export interface ProductWithStatus extends ProductConfiguration {
  isActive: boolean
  runsThisWeek?: number
}

export type TabType = 'runs' | 'paused' | 'products'

import type { Run, RunItem } from '@/shared/types/run'
import type { ProductConfiguration } from '@/shared/types/product'

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
}

export type DateRangeFilter = 'all' | 'today' | '7days' | '30days'

export interface RunFilters {
  status: RunStatus | 'all'
  productKey: string | 'all'
  search: string
  dateRange: DateRangeFilter
}

export interface ProductWithStatus extends ProductConfiguration {
  isActive: boolean
  runsThisWeek?: number
}

export type TabType = 'runs' | 'products'

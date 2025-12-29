import { useState, useEffect, useCallback } from 'react'
import type { CredentialsTestFrontendResult } from '@/shared/ipc/contracts'

export type Platform = 'alptis' | 'swisslife' | 'entoria'

export type CredentialInfo = {
  platform: Platform
  login: string
  hasPassword: boolean
  hasCourtierCode?: boolean // Only for Entoria
}

export type CredentialFormData = {
  login: string
  password: string
  courtierCode?: string // Only for Entoria
}

export type TestStatus = 'idle' | 'testing' | 'success' | 'error'

export type PlatformState = {
  info: CredentialInfo | null
  loading: boolean
  saving: boolean
  testStatus: TestStatus
  testError?: string
}

const PLATFORMS: Platform[] = ['alptis', 'swisslife', 'entoria']

export function useCredentials() {
  const [states, setStates] = useState<Record<Platform, PlatformState>>({
    alptis: { info: null, loading: true, saving: false, testStatus: 'idle' },
    swisslife: { info: null, loading: true, saving: false, testStatus: 'idle' },
    entoria: { info: null, loading: true, saving: false, testStatus: 'idle' },
  })

  const updatePlatformState = useCallback(
    (platform: Platform, updates: Partial<PlatformState>) => {
      setStates((prev) => ({
        ...prev,
        [platform]: { ...prev[platform], ...updates },
      }))
    },
    []
  )

  const fetchCredential = useCallback(
    async (platform: Platform) => {
      updatePlatformState(platform, { loading: true })
      try {
        const result = await window.api.credentials.get(platform)
        updatePlatformState(platform, {
          info: result as CredentialInfo | null,
          loading: false,
        })
      } catch (error) {
        console.error(`Failed to fetch credentials for ${platform}:`, error)
        updatePlatformState(platform, { info: null, loading: false })
      }
    },
    [updatePlatformState]
  )

  const fetchAll = useCallback(async () => {
    await Promise.all(PLATFORMS.map(fetchCredential))
  }, [fetchCredential])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const save = useCallback(
    async (platform: Platform, data: CredentialFormData): Promise<boolean> => {
      updatePlatformState(platform, { saving: true, testStatus: 'idle', testError: undefined })
      try {
        await window.api.credentials.upsert({
          platform,
          login: data.login,
          password: data.password,
          courtierCode: data.courtierCode, // Only for Entoria
        })
        await fetchCredential(platform)
        updatePlatformState(platform, { saving: false })
        return true
      } catch (error) {
        console.error(`Failed to save credentials for ${platform}:`, error)
        updatePlatformState(platform, { saving: false })
        return false
      }
    },
    [fetchCredential, updatePlatformState]
  )

  const remove = useCallback(
    async (platform: Platform): Promise<boolean> => {
      updatePlatformState(platform, { saving: true })
      try {
        await window.api.credentials.delete(platform)
        updatePlatformState(platform, {
          info: null,
          saving: false,
          testStatus: 'idle',
          testError: undefined,
        })
        return true
      } catch (error) {
        console.error(`Failed to delete credentials for ${platform}:`, error)
        updatePlatformState(platform, { saving: false })
        return false
      }
    },
    [updatePlatformState]
  )

  const test = useCallback(
    async (platform: Platform): Promise<CredentialsTestFrontendResult> => {
      updatePlatformState(platform, { testStatus: 'testing', testError: undefined })
      try {
        const result = await window.api.credentials.test(platform)
        updatePlatformState(platform, {
          testStatus: result.ok ? 'success' : 'error',
          testError: result.message,
        })
        return result
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Test failed'
        updatePlatformState(platform, { testStatus: 'error', testError: message })
        return { ok: false, error: 'BROWSER_ERROR', message }
      }
    },
    [updatePlatformState]
  )

  const resetTestStatus = useCallback(
    (platform: Platform) => {
      updatePlatformState(platform, { testStatus: 'idle', testError: undefined })
    },
    [updatePlatformState]
  )

  return {
    states,
    platforms: PLATFORMS,
    save,
    remove,
    test,
    resetTestStatus,
    refresh: fetchAll,
  }
}

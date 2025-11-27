import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface UseMailConnectionOptions {
  onSuccess?: () => void
}

export function useMailConnection(options: UseMailConnectionOptions = {}) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = useCallback(async () => {
    setIsConnecting(true)
    try {
      await window.api.mail.connect()
      toast.success('Gmail connected successfully')
      options.onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setIsConnecting(false)
    }
  }, [options])

  const handleDisconnect = useCallback(async () => {
    try {
      await window.api.mail.disconnect()
      toast.success('Gmail disconnected')
      options.onSuccess?.()
    } catch {
      toast.error('Failed to disconnect')
    }
  }, [options])

  const handleCancelConnect = useCallback(async () => {
    try {
      await window.api.mail.cancelConnect()
      toast.info('Connection cancelled')
    } finally {
      setIsConnecting(false)
    }
  }, [])

  return {
    isConnecting,
    handleConnect,
    handleDisconnect,
    handleCancelConnect,
  }
}

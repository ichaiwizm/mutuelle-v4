import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
  Trash2,
  KeyRound,
  CircleDot,
} from 'lucide-react'
import { Card } from '@/renderer/components/ui/Card'
import { Input } from '@/renderer/components/ui/Input'
import { Button } from '@/renderer/components/ui/Button'
import type { Platform, PlatformState, CredentialFormData } from '../hooks/useCredentials'

interface CredentialCardProps {
  platform: Platform
  state: PlatformState
  onSave: (data: CredentialFormData) => Promise<boolean>
  onDelete: () => Promise<boolean>
  onTest: () => Promise<any>
  onResetTest: () => void
}

const PLATFORM_CONFIG: Record<
  Platform,
  {
    name: string
    description: string
    accentColor: string
    accentBg: string
    accentBorder: string
    icon: string
  }
> = {
  alptis: {
    name: 'Alptis',
    description: 'Portail courtier Alptis Assurances',
    accentColor: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/30',
    icon: '🏔️',
  },
  swisslife: {
    name: 'SwissLife One',
    description: 'Plateforme SwissLife One',
    accentColor: 'text-rose-400',
    accentBg: 'bg-rose-500/10',
    accentBorder: 'border-rose-500/30',
    icon: '🔴',
  },
}

export function CredentialCard({
  platform,
  state,
  onSave,
  onDelete,
  onTest,
  onResetTest,
}: CredentialCardProps) {
  const config = PLATFORM_CONFIG[platform]
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<CredentialFormData>({ login: '', password: '' })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isConfigured = !!state.info?.hasPassword
  const { loading, saving, testStatus, testError } = state

  // Reset form when exiting edit mode
  useEffect(() => {
    if (!isEditing) {
      setFormData({ login: state.info?.login || '', password: '' })
      setShowPassword(false)
    }
  }, [isEditing, state.info?.login])

  // Enter edit mode if no credentials configured
  useEffect(() => {
    if (!loading && !isConfigured && !isEditing) {
      setIsEditing(true)
    }
  }, [loading, isConfigured, isEditing])

  const handleSave = useCallback(async () => {
    if (!formData.login.trim() || !formData.password.trim()) return
    const success = await onSave(formData)
    if (success) {
      setIsEditing(false)
      setFormData({ login: '', password: '' })
    }
  }, [formData, onSave])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    setFormData({ login: state.info?.login || '', password: '' })
    onResetTest()
  }, [state.info?.login, onResetTest])

  const handleDelete = useCallback(async () => {
    await onDelete()
    setShowDeleteConfirm(false)
    setIsEditing(true)
  }, [onDelete])

  const handleTest = useCallback(async () => {
    await onTest()
  }, [onTest])

  if (loading) {
    return (
      <Card className="p-6 border-[var(--color-border)] animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[var(--color-border)]" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 rounded bg-[var(--color-border)]" />
            <div className="h-4 w-48 rounded bg-[var(--color-border)]" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        'border-[var(--color-border)]',
        isConfigured && !isEditing && config.accentBorder
      )}
    >
      {/* Accent stripe */}
      <div
        className={cn(
          'absolute top-0 left-0 w-1 h-full transition-all duration-300',
          isConfigured ? config.accentBg.replace('/10', '/60') : 'bg-zinc-600/40'
        )}
      />

      <div className="p-6 pl-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            {/* Platform Icon */}
            <div
              className={cn(
                'flex items-center justify-center h-12 w-12 rounded-xl text-2xl',
                'bg-[var(--color-surface)] border border-[var(--color-border)]',
                'shadow-sm'
              )}
            >
              {config.icon}
            </div>

            {/* Platform Info */}
            <div>
              <h3 className="font-semibold text-lg text-[var(--color-text-primary)] tracking-tight">
                {config.name}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)]">{config.description}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
              'border transition-all duration-300',
              isConfigured
                ? `${config.accentBg} ${config.accentColor} ${config.accentBorder}`
                : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
            )}
          >
            {isConfigured ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5" />
                Configuré
              </>
            ) : (
              <>
                <ShieldX className="h-3.5 w-3.5" />
                Non configuré
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {isEditing ? (
          /* Edit Form */
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Login Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Identifiant
                </label>
                <Input
                  type="text"
                  placeholder="Votre identifiant"
                  value={formData.login}
                  onChange={(e) => setFormData((prev) => ({ ...prev, login: e.target.value }))}
                  disabled={saving}
                  className="bg-[var(--color-surface)]"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Mot de passe
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isConfigured ? '••••••••' : 'Votre mot de passe'}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    disabled={saving}
                    className="bg-[var(--color-surface)] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={cn(
                      'absolute right-3 top-1/2 -translate-y-1/2',
                      'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
                      'transition-colors'
                    )}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                <KeyRound className="h-3.5 w-3.5" />
                Chiffrement AES-256
              </div>
              <div className="flex items-center gap-2">
                {isConfigured && (
                  <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
                    Annuler
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || !formData.login.trim() || !formData.password.trim()}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-4">
            {/* Credential Info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="flex-1">
                <div className="text-xs text-[var(--color-text-muted)] mb-1">Identifiant</div>
                <div className="font-mono text-sm text-[var(--color-text-primary)]">
                  {state.info?.login}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-[var(--color-text-muted)] mb-1">Mot de passe</div>
                <div className="font-mono text-sm text-[var(--color-text-muted)]">••••••••</div>
              </div>
            </div>

            {/* Test Status */}
            {testStatus !== 'idle' && (
              <div
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  testStatus === 'testing' && 'bg-blue-500/10 border-blue-500/30 text-blue-400',
                  testStatus === 'success' &&
                    'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                  testStatus === 'error' && 'bg-red-500/10 border-red-500/30 text-red-400'
                )}
              >
                {testStatus === 'testing' && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Test de connexion en cours...</span>
                  </>
                )}
                {testStatus === 'success' && (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-sm">Connexion réussie</span>
                  </>
                )}
                {testStatus === 'error' && (
                  <>
                    <ShieldX className="h-4 w-4" />
                    <span className="text-sm">{testError || 'Échec de la connexion'}</span>
                  </>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              {/* Delete */}
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--color-text-muted)]">Supprimer ?</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={saving}
                  >
                    Non
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={saving}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Oui, supprimer'}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-[var(--color-text-muted)] hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              )}

              {/* Edit & Test */}
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                  Modifier
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleTest}
                  disabled={testStatus === 'testing'}
                >
                  {testStatus === 'testing' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Test...
                    </>
                  ) : (
                    <>
                      <CircleDot className="h-4 w-4 mr-2" />
                      Tester
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

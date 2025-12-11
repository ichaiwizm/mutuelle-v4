import { Link } from 'react-router-dom'
import { Check, ArrowRight, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/renderer/components/ui'
import { useOnboarding } from '../context/OnboardingContext'
import type { OnboardingStep } from '../types'

interface SetupStepProps {
  step: OnboardingStep & { completed: boolean }
}

function SetupStep({ step }: SetupStepProps) {
  const Icon = step.icon

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border transition-colors',
        step.completed
          ? 'border-[var(--color-success)]/30 bg-[var(--color-success)]/5'
          : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0',
          step.completed ? 'bg-[var(--color-success)]/20' : 'bg-[var(--color-surface-hover)]'
        )}
      >
        {step.completed ? (
          <Check className="h-4 w-4 text-[var(--color-success)]" />
        ) : (
          <Icon className="h-4 w-4 text-[var(--color-text-muted)]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-medium text-sm',
            step.completed ? 'text-[var(--color-success)]' : 'text-[var(--color-text-primary)]'
          )}
        >
          {step.title}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{step.description}</p>
        {!step.completed && (
          <p className="text-xs text-[var(--color-text-muted)]/70 mt-1.5 italic">{step.helpText}</p>
        )}
      </div>

      {/* Action */}
      {!step.completed && (
        <Link to={step.link} className="flex-shrink-0">
          <button className="inline-flex items-center gap-1 h-7 px-2.5 text-xs font-medium rounded-md border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-hover)] transition-colors">
            {step.linkLabel}
            <ArrowRight className="h-3 w-3" />
          </button>
        </Link>
      )}
    </div>
  )
}

interface SetupChecklistProps {
  className?: string
}

export function SetupChecklist({ className }: SetupChecklistProps) {
  const { steps, isComplete, isDismissed, completedCount, totalSteps, dismissOnboarding } =
    useOnboarding()

  // Don't show if complete or dismissed
  if (isComplete || isDismissed) {
    return null
  }

  const progressPercent = (completedCount / totalSteps) * 100

  return (
    <Card
      className={cn(
        'p-5 border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--color-primary)]" />
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Bienvenue ! Configurez votre application
          </h2>
        </div>
        <button
          onClick={dismissOnboarding}
          className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
          title="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-[var(--color-text-muted)]">Configuration</span>
          <span className="text-[var(--color-text-secondary)]">
            {completedCount}/{totalSteps} étapes
          </span>
        </div>
        <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step) => (
          <SetupStep key={step.id} step={step} />
        ))}
      </div>
    </Card>
  )
}

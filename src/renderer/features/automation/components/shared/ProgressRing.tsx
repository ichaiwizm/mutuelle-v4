import { cn } from '@/lib/utils'

interface ProgressRingProps {
  progress: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  showPercent?: boolean
  showPercentage?: boolean // alias for showPercent
  className?: string
  strokeWidth?: number
  color?: string // custom color for progress stroke
}

const SIZES = {
  sm: { diameter: 32, stroke: 3, fontSize: 'text-[10px]' },
  md: { diameter: 48, stroke: 4, fontSize: 'text-xs' },
  lg: { diameter: 64, stroke: 5, fontSize: 'text-sm' },
}

export function ProgressRing({
  progress,
  size = 'md',
  showPercent = true,
  showPercentage,
  className,
  strokeWidth,
  color,
}: ProgressRingProps) {
  const config = SIZES[size]
  const stroke = strokeWidth ?? config.stroke
  const radius = (config.diameter - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference
  const strokeColor = color ?? 'var(--color-primary)'
  const displayPercent = showPercentage ?? showPercent

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={config.diameter}
        height={config.diameter}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        {/* Progress circle */}
        <circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
          style={{
            filter: progress > 0 ? `drop-shadow(0 0 4px ${strokeColor})` : 'none',
          }}
        />
      </svg>
      {displayPercent && (
        <span
          className={cn(
            'absolute font-medium text-[var(--color-text-primary)]',
            config.fontSize
          )}
        >
          {Math.round(progress)}%
        </span>
      )}
    </div>
  )
}

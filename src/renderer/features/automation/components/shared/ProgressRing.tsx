import { cn } from '@/lib/utils'

interface ProgressRingProps {
  progress: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  showPercent?: boolean
  showPercentage?: boolean // alias for showPercent
  className?: string
  strokeWidth?: number
  color?: string // custom color for progress stroke
  isAnimating?: boolean // animate when in progress
}

const SIZES = {
  sm: { diameter: 40, trackStroke: 2, progressStroke: 3, fontSize: 'text-xs', percentSize: 'text-[8px]' },
  md: { diameter: 56, trackStroke: 2, progressStroke: 4, fontSize: 'text-sm', percentSize: 'text-[10px]' },
  lg: { diameter: 88, trackStroke: 3, progressStroke: 5, fontSize: 'text-xl', percentSize: 'text-xs' },
}

export function ProgressRing({
  progress,
  size = 'md',
  showPercent = true,
  showPercentage,
  className,
  strokeWidth,
  color,
  isAnimating = false,
}: ProgressRingProps) {
  const config = SIZES[size]
  const trackStroke = config.trackStroke
  const progressStroke = strokeWidth ?? config.progressStroke

  // Use the larger stroke for radius calculation to ensure both fit
  const maxStroke = Math.max(trackStroke, progressStroke)
  const radius = (config.diameter - maxStroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference
  const strokeColor = color ?? 'var(--color-primary)'
  const displayPercent = showPercentage ?? showPercent

  // Generate unique gradient ID for this instance
  const gradientId = `progress-gradient-${Math.random().toString(36).slice(2, 9)}`

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      {/* Outer glow effect when animating */}
      {isAnimating && progress > 0 && (
        <div
          className="absolute inset-0 rounded-full animate-pulse opacity-30"
          style={{
            background: `radial-gradient(circle, ${strokeColor} 0%, transparent 70%)`,
            transform: 'scale(1.2)',
          }}
        />
      )}

      <svg
        width={config.diameter}
        height={config.diameter}
        className="transform -rotate-90"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.6" />
            <stop offset="50%" stopColor={strokeColor} stopOpacity="1" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Background track - thin and subtle */}
        <circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={trackStroke}
          className="text-white/[0.06]"
        />

        {/* Progress arc */}
        {progress > 0 && (
          <circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={progressStroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${strokeColor})`,
            }}
          />
        )}
      </svg>

      {/* Center content */}
      {displayPercent && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            'font-bold tabular-nums tracking-tight',
            config.fontSize,
            isAnimating ? 'text-white' : 'text-white/70'
          )}>
            {Math.round(progress)}
            <span className={cn('font-medium text-white/50', config.percentSize)}>%</span>
          </span>
        </div>
      )}
    </div>
  )
}

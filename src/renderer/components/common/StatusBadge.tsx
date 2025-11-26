import { cn } from "@/lib/utils";

export type StatusVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "neutral"
  | "running"
  | "queued";

type StatusBadgeProps = {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
};

const variantClasses: Record<StatusVariant, string> = {
  success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  running: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  queued: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const dotClasses: Record<StatusVariant, string> = {
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-yellow-500",
  info: "bg-blue-500",
  neutral: "bg-gray-500",
  running: "bg-blue-500 animate-pulse",
  queued: "bg-gray-400",
};

export function StatusBadge({ variant, children, className, dot = false }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotClasses[variant])} />}
      {children}
    </span>
  );
}

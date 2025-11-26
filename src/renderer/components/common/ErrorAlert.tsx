import { cn } from "@/lib/utils";
import type { StoreError } from "@/renderer/stores/types";

type ErrorAlertProps = {
  error: StoreError | null;
  className?: string;
  onRetry?: () => void;
};

export function ErrorAlert({ error, className, onRetry }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <div
      className={cn(
        "rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-red-500">⚠</span>
        <div className="flex-1">
          <p className="font-medium text-red-800 dark:text-red-300">
            {error.message}
          </p>
          {error.code && (
            <p className="mt-1 text-red-600 dark:text-red-400 text-xs">
              Code: {error.code}
            </p>
          )}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-red-600 dark:text-red-400 hover:underline text-xs"
          >
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
}

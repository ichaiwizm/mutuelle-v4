import type { ReactNode } from 'react';

type Status = 'idle' | 'running' | 'success' | 'error';

interface StatusIndicatorProps {
  status: Status;
  flowName?: string;
}

const statusConfig: Record<Status, { color: string; label: string; animate: boolean }> = {
  idle: { color: 'bg-gray-500', label: 'Ready', animate: false },
  running: { color: 'bg-blue-500', label: 'Running', animate: true },
  success: { color: 'bg-emerald-500', label: 'Completed', animate: false },
  error: { color: 'bg-red-500', label: 'Error', animate: false },
};

export function StatusIndicator({ status, flowName }: StatusIndicatorProps): ReactNode {
  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div>
        <p className="text-sm text-gray-400">Current Flow</p>
        <p className="text-lg font-medium text-white">{flowName || 'No flow selected'}</p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`w-3 h-3 rounded-full ${config.color} ${config.animate ? 'animate-pulse' : ''}`}
        />
        <span className="text-sm font-medium text-gray-300">{config.label}</span>
      </div>
    </div>
  );
}

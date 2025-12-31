import { useEffect, useRef, type ReactNode } from 'react';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  stepId?: string;
}

interface LogViewerProps {
  logs: LogEntry[];
  className?: string;
}

const levelStyles: Record<LogLevel, { text: string; badge: string }> = {
  debug: { text: 'text-gray-400', badge: 'bg-gray-700 text-gray-300' },
  info: { text: 'text-blue-400', badge: 'bg-blue-900 text-blue-300' },
  warn: { text: 'text-yellow-400', badge: 'bg-yellow-900 text-yellow-300' },
  error: { text: 'text-red-400', badge: 'bg-red-900 text-red-300' },
};

export function LogViewer({ logs, className = '' }: LogViewerProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  // Check if user has scrolled up
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    shouldAutoScroll.current = scrollHeight - scrollTop - clientHeight < 50;
  };

  useEffect(() => {
    if (containerRef.current && shouldAutoScroll.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`bg-gray-950 font-mono text-sm overflow-y-auto rounded-lg border border-gray-700 ${className}`}
    >
      {logs.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 p-8">
          <p>Waiting for logs...</p>
        </div>
      ) : (
        <div className="p-3 space-y-1">
          {logs.map(log => {
            const styles = levelStyles[log.level];
            return (
              <div key={log.id} className="flex items-start gap-2 py-1">
                <span className="text-gray-600 shrink-0 tabular-nums">
                  {formatTime(log.timestamp)}
                </span>
                <span
                  className={`shrink-0 px-1.5 py-0.5 rounded text-xs font-medium ${styles.badge}`}
                >
                  {log.level.toUpperCase()}
                </span>
                <span className={`break-all ${styles.text}`}>{log.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LogViewer;

interface ErrorDisplayProps {
  title?: string;
  message: string;
}

export function ErrorDisplay({ title = 'An error occurred', message }: ErrorDisplayProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div
        className="p-6 rounded-xl border max-w-md text-center"
        style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)', borderColor: 'var(--status-error)' }}
      >
        <p style={{ color: 'var(--status-error)' }}>{title}</p>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{message}</p>
      </div>
    </div>
  );
}

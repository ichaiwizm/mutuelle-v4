interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="px-8 py-6 border-b flex-shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
      {description && (
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{description}</p>
      )}
    </header>
  );
}

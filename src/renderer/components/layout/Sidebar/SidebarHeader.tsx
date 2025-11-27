export function SidebarHeader() {
  return (
    <div className="flex h-14 items-center gap-2 border-b border-[var(--color-border)] px-4">
      <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]">
        <span className="text-sm font-bold text-white">M</span>
      </div>
      <span className="font-semibold">Mutuelles</span>
    </div>
  )
}

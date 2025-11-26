import { cn } from "@/lib/utils";

type NavButtonProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

export function NavButton({ active, onClick, children }: NavButtonProps) {
  return (
    <button
      className={cn(
        "px-3 py-2 rounded text-sm font-medium transition-colors",
        active
          ? "bg-foreground text-background"
          : "border border-border hover:bg-muted"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

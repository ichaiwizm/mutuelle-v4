import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "./LoadingSpinner";

type StatCardProps = {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
};

export function StatCard({
  icon,
  label,
  value,
  sublabel,
  loading = false,
  className,
  onClick,
}: StatCardProps) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Card
      className={cn(
        onClick && "cursor-pointer hover:bg-muted/50 transition-colors",
        className
      )}
    >
      <Wrapper onClick={onClick} className="w-full text-left">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {label}
              </p>
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <p className="text-2xl font-bold">{value}</p>
              )}
              {sublabel && (
                <p className="text-xs text-muted-foreground">{sublabel}</p>
              )}
            </div>
            {icon && (
              <div className="text-muted-foreground opacity-70">{icon}</div>
            )}
          </div>
        </CardContent>
      </Wrapper>
    </Card>
  );
}

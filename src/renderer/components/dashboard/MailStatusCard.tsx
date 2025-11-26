import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../common/StatusBadge";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { toast } from "sonner";

type MailStatusCardProps = {
  isConnected: boolean;
  email?: string;
  connecting: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
};

export function MailStatusCard({
  isConnected,
  email,
  connecting,
  onConnect,
  onDisconnect,
}: MailStatusCardProps) {
  const handleConnect = async () => {
    try {
      await onConnect();
      toast.success("Gmail connecté");
    } catch (err) {
      toast.error("Échec de connexion Gmail", {
        description: (err as Error).message,
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await onDisconnect();
      toast.success("Gmail déconnecté");
    } catch (err) {
      toast.error("Échec de déconnexion", {
        description: (err as Error).message,
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MailIcon />
          Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <StatusBadge variant={isConnected ? "success" : "neutral"} dot>
            {isConnected ? "Connecté" : "Déconnecté"}
          </StatusBadge>
        </div>

        {isConnected && email && (
          <p className="text-sm text-muted-foreground truncate">{email}</p>
        )}

        <Button
          variant={isConnected ? "outline" : "default"}
          size="sm"
          className="w-full"
          onClick={isConnected ? handleDisconnect : handleConnect}
          disabled={connecting}
        >
          {connecting ? (
            <LoadingSpinner size="sm" className="mr-2" />
          ) : null}
          {isConnected ? "Déconnecter" : "Connecter Gmail"}
        </Button>
      </CardContent>
    </Card>
  );
}

function MailIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

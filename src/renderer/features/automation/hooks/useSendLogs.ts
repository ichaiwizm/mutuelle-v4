import { useState, useCallback } from "react";
import { toast } from "sonner";

type SendLogsOptions = {
  runId: string;
  userMessage?: string;
};

/**
 * Hook to send run logs to support via Sentry.
 */
export function useSendLogs() {
  const [sending, setSending] = useState(false);

  const sendLogs = useCallback(async (options: SendLogsOptions) => {
    setSending(true);
    try {
      const result = await window.api.support.sendLogs(options);

      if (result.sent) {
        toast.success("Logs envoyés au support", {
          description: "Notre équipe analysera les données.",
        });
        return true;
      } else {
        toast.error("Échec de l'envoi", {
          description: result.error || "Veuillez réessayer.",
        });
        return false;
      }
    } catch (err) {
      console.error("Failed to send logs:", err);
      toast.error("Erreur lors de l'envoi des logs");
      return false;
    } finally {
      setSending(false);
    }
  }, []);

  return { sendLogs, sending };
}

import { FileText, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/renderer/components/ui/Card";

interface DevisWidgetProps {
  total: number;
  pending: number;
  completed: number;
  failed: number;
}

/**
 * Dashboard widget showing devis statistics
 */
export function DevisWidget({ total, pending, completed, failed }: DevisWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Devis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{total}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pending}</p>
            <p className="text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              En attente
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completed}</p>
            <p className="text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Complétés
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{failed}</p>
            <p className="text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-1">
              <XCircle className="h-3 w-3" />
              Échoués
            </p>
          </div>
        </div>

        {/* View all link */}
        <Link
          to="/devis"
          className="flex items-center justify-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
        >
          Voir tous les devis
          <ChevronRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
